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

## セットアップ

Node.js 22以上が必要です。

```bash
npm install
cp .env.example .env
```

`.env` に OpenAI API キーを設定します。

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-5.6-luna
PORT=3000
```

起動します。

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

## GitHubに新規リポジトリとして作る場合

GitHub CLIを使える環境なら、このディレクトリで次を実行できます。

```bash
git init
git add .
git commit -m "feat: initialize EXIT COST bot"
gh repo create exit-cost-bot --public --source=. --remote=origin --push
```

privateにしたい場合は `--public` を `--private` に変更してください。

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
