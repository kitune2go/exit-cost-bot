const input = document.querySelector("#caseText");
const analyzeButton = document.querySelector("#analyze");
const copyButton = document.querySelector("#copy");
const output = document.querySelector("#output");
const status = document.querySelector("#status");
const count = document.querySelector("#count");

input.addEventListener("input", () => {
  count.textContent = `${input.value.length} / 12000`;
});

analyzeButton.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!text) {
    status.textContent = "分析する事例を入力してください。";
    return;
  }

  analyzeButton.disabled = true;
  copyButton.disabled = true;
  output.textContent = "";
  status.textContent = "構造を分析しています…";

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "分析に失敗しました。");

    output.textContent = data.analysis;
    status.textContent = "分析完了";
    copyButton.disabled = false;
  } catch (error) {
    status.textContent = error.message;
  } finally {
    analyzeButton.disabled = false;
  }
});

copyButton.addEventListener("click", async () => {
  await navigator.clipboard.writeText(output.textContent);
  const previous = copyButton.textContent;
  copyButton.textContent = "コピー済み";
  setTimeout(() => { copyButton.textContent = previous; }, 1200);
});
