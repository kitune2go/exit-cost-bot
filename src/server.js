import crypto from "node:crypto";
import express from "express";
import OpenAI from "openai";
import { SYSTEM_PROMPT } from "./prompt.js";

try {
  process.loadEnvFile?.();
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

const app = express();
const port = Number(process.env.PORT || 3000);
const requireAuth = process.env.REQUIRE_AUTH === "true";
const appUsername = process.env.APP_USERNAME || "exit";
const appPassword = process.env.APP_PASSWORD || "";
const rateLimitMax = Number(process.env.RATE_LIMIT_MAX || 20);
const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MINUTES || 10) * 60_000;
const rateBuckets = new Map();

app.set("trust proxy", 1);
app.use(express.json({ limit: "32kb" }));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    provider: process.env.LLM_BASE_URL ? "openai-compatible" : "openai",
    model: process.env.LLM_MODEL || process.env.OPENAI_MODEL || "gpt-5.6-luna"
  });
});

function safeEqual(left, right) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function basicAuth(req, res, next) {
  if (!requireAuth) return next();

  if (!appPassword) {
    return res.status(503).send("APP_PASSWORD is not configured.");
  }

  const header = req.headers.authorization || "";
  const [scheme, encoded] = header.split(" ");

  if (scheme !== "Basic" || !encoded) {
    res.set("WWW-Authenticate", 'Basic realm="EXIT COST"');
    return res.status(401).send("Authentication required.");
  }

  let credentials;
  try {
    credentials = Buffer.from(encoded, "base64").toString("utf8");
  } catch {
    credentials = "";
  }

  const separator = credentials.indexOf(":");
  const username = separator >= 0 ? credentials.slice(0, separator) : "";
  const password = separator >= 0 ? credentials.slice(separator + 1) : "";

  if (!safeEqual(username, appUsername) || !safeEqual(password, appPassword)) {
    res.set("WWW-Authenticate", 'Basic realm="EXIT COST"');
    return res.status(401).send("Invalid credentials.");
  }

  next();
}

function rateLimit(req, res, next) {
  const now = Date.now();
  const key = req.ip || "unknown";
  const current = rateBuckets.get(key);

  if (!current || current.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + rateLimitWindowMs });
    return next();
  }

  if (current.count >= rateLimitMax) {
    const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    res.set("Retry-After", String(retryAfterSeconds));
    return res.status(429).json({ error: "短時間の利用上限に達しました。しばらくしてから再実行してください。" });
  }

  current.count += 1;
  next();
}

app.use(basicAuth);
app.use(express.static("public"));

app.post("/api/analyze", rateLimit, async (req, res) => {
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";

  if (!text) {
    return res.status(400).json({ error: "分析する文章を入力してください。" });
  }

  if (text.length > 12000) {
    return res.status(400).json({ error: "入力が長すぎます。12,000文字以内にしてください。" });
  }

  const baseURL = process.env.LLM_BASE_URL?.trim();
  const model = process.env.LLM_MODEL || process.env.OPENAI_MODEL || (baseURL ? "qwen3:8b" : "gpt-5.6-luna");

  if (!baseURL && !process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: "OPENAI_API_KEY または LLM_BASE_URL が設定されていません。"
    });
  }

  try {
    let analysis = "";

    if (baseURL) {
      const client = new OpenAI({
        baseURL,
        apiKey: process.env.LLM_API_KEY || "local"
      });
      const response = await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text }
        ]
      });
      analysis = response.choices?.[0]?.message?.content || "";
    } else {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await client.responses.create({
        model,
        instructions: SYSTEM_PROMPT,
        input: text
      });
      analysis = response.output_text || "";
    }

    return res.json({ analysis: analysis || "出力を取得できませんでした。" });
  } catch (error) {
    console.error(error);
    const status = Number(error?.status) || 500;
    return res.status(status).json({
      error: status === 401
        ? "LLM側の認証情報を確認してください。"
        : "分析に失敗しました。接続先とモデル設定を確認してください。"
    });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`EXIT COST running on port ${port}`);
  if (!requireAuth) {
    console.warn("WARNING: REQUIRE_AUTH is false. Do not expose this instance publicly without access controls.");
  }
});
