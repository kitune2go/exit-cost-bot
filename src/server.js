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

app.use(express.json({ limit: "32kb" }));
app.use(express.static("public"));

app.get("/health", (_req, res) => {
  res.json({ ok: true, model: process.env.OPENAI_MODEL || "gpt-5.6-luna" });
});

app.post("/api/analyze", async (req, res) => {
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";

  if (!text) {
    return res.status(400).json({ error: "分析する文章を入力してください。" });
  }

  if (text.length > 12000) {
    return res.status(400).json({ error: "入力が長すぎます。12,000文字以内にしてください。" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: "OPENAI_API_KEY が設定されていません。.env.example を参照してください。"
    });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
      instructions: SYSTEM_PROMPT,
      input: text
    });

    return res.json({ analysis: response.output_text || "出力を取得できませんでした。" });
  } catch (error) {
    console.error(error);
    const status = Number(error?.status) || 500;
    return res.status(status).json({
      error: status === 401
        ? "APIキーを確認してください。"
        : "分析に失敗しました。時間をおいて再実行してください。"
    });
  }
});

app.listen(port, () => {
  console.log(`EXIT COST running at http://localhost:${port}`);
});
