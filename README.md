# EXIT COST

> 支配とは、入口を閉じることではなく、出口を閉じることで成立する。

組織、制度、市場、企業、宗教団体、コミュニティ、プラットフォームなどを、**参加時の誘因と退出時の制約の非対称性**から分析する小さなLLM Botです。

単純な断罪Botではありません。通常のスイッチングコスト、制度的ロックイン、意図的な出口封鎖を区別し、反証条件まで出したうえで、最後に分析全体を一文の「圧縮命題」にします。

## 出力

- 判定
- 入口
- 依存
- 出口
- 意図と構造
- 反証
- 圧縮命題

## ローカル起動

Node.js 22以上が必要です。

```bash
npm install
cp .env.example .env
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

OpenAIを使う場合は `.env` に次を設定します。

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-5.6-luna
```

`.env` は `.gitignore` に含まれているため、実キーをGitHubへコミットしないでください。

## 公開するときの保護

公開環境では最低限、認証を有効にしてください。

```env
REQUIRE_AUTH=true
APP_USERNAME=exit
APP_PASSWORD=十分に長いパスワード
RATE_LIMIT_MAX=20
RATE_LIMIT_WINDOW_MINUTES=10
```

`REQUIRE_AUTH=true` の状態で `APP_PASSWORD` が未設定なら、保護対象の画面・APIは利用できません。

`/health` だけはデプロイ先の死活監視用に認証なしで公開されます。APIキーなどの秘密情報は返しません。

レート制限は単一プロセス向けの簡易実装です。大規模公開する場合はRedis等の共有ストアを使う方式へ変更してください。

## Self-hosted LLM

OpenAI互換APIを提供するvLLM、Ollama等に接続できます。`LLM_BASE_URL` を設定すると、OpenAI Responses APIではなくOpenAI互換のChat Completionsを使います。

```env
LLM_BASE_URL=https://your-llm-server.example/v1
LLM_API_KEY=your_internal_token
LLM_MODEL=your-model-name
```

ローカルのOllama等で認証が不要な場合、`LLM_API_KEY` は空でも構いません。

## Render等へデプロイする場合

リポジトリには `render.yaml` を含めています。Render側のEnvironment Variables / Secretsに、少なくとも次を登録してください。

```text
OPENAI_API_KEY   または LLM_BASE_URL / LLM_API_KEY
APP_PASSWORD
```

秘密情報はGitHubのコードへ書かず、ホスティングサービス側のSecret / Environment Variableとして保存します。

## 設計原則

EXIT COSTは、入力された対象を最初から「支配」と決めつけません。

1. 入口で提示される誘因を見る。
2. 参加後に形成される依存を見る。
3. 退出時に発生するコストを見る。
4. 自由参加と自由退出を区別する。
5. 意図的な支配と制度上の帰結を区別する。
6. 分析が誤りになる条件も出す。
7. 最後に一文へ圧縮する。

## 圧縮命題の例

> 無料の入口は自由を意味しない。退出時に失うものが増えるほど、選択は制度への依存へ変わる。

## License

MIT
