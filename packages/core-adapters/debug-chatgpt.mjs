// 诊断脚本 - 在 core-adapters 目录运行: node debug-chatgpt.mjs

const url = "https://chatgpt.com/s/t_697d18779aa881919116540dc9f52a9a";

console.log("=== 1. 测试网络连接 ===");
try {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      "Accept": "text/html",
    },
  });
  console.log("HTTP Status:", response.status);
  console.log("Content-Type:", response.headers.get("content-type"));

  if (!response.ok) {
    console.log("❌ 请求失败");
    process.exit(1);
  }

  const html = await response.text();
  console.log("HTML 长度:", html.length);

  console.log("\n=== 2. 检查 enqueue 模式 ===");
  const enqueueMatches = html.match(/\.enqueue\("/g);
  console.log("找到 .enqueue 数量:", enqueueMatches?.length || 0);

  if (!enqueueMatches) {
    console.log("❌ 没有找到 enqueue 模式");
    console.log("HTML 前 500 字符:", html.substring(0, 500));
    process.exit(1);
  }

  console.log("\n=== 3. 提取并解析数据 ===");
  const regex = /\.enqueue\("((?:[^"\\]|\\.)*)"\)/g;
  let match;
  let chunkCount = 0;

  while ((match = regex.exec(html)) !== null) {
    chunkCount++;
    const raw = match[1];
    if (raw.length < 100) continue;

    console.log(`\nChunk ${chunkCount}: 原始长度 ${raw.length}`);

    try {
      const decoded = new Function('return "' + raw + '"')();
      console.log("解码后长度:", decoded.length);

      const data = JSON.parse(decoded);
      console.log("JSON 数组长度:", data.length);

      // 查找消息
      let userMsg = null;
      let assistantMsg = null;

      // 找用户消息
      for (let i = 0; i < data.length - 1; i++) {
        if (data[i] === "text" && typeof data[i + 1] === "string" && data[i + 1].length > 3) {
          const context = data.slice(Math.max(0, i - 15), i);
          if (context.some(x => x === "post" || x === "attachments")) {
            userMsg = data[i + 1];
            break;
          }
        }
      }

      // 找助手消息
      for (let i = 0; i < data.length - 1; i++) {
        if (data[i] === "role" && data[i + 1] === "assistant") {
          for (let j = i + 2; j < Math.min(i + 40, data.length - 1); j++) {
            if (data[j] === "parts") {
              const partsRef = data[j + 1];
              if (Array.isArray(partsRef) && partsRef.length === 1 && typeof partsRef[0] === "number") {
                assistantMsg = data[partsRef[0]];
              }
              break;
            }
          }
        }
      }

      console.log("\n✅ 找到消息:");
      if (userMsg) console.log("User:", userMsg.substring(0, 50) + "...");
      if (assistantMsg) console.log("Assistant:", assistantMsg.substring(0, 50) + "...");

      if (!userMsg && !assistantMsg) {
        console.log("❌ 没有找到消息，打印数组前 30 个元素:");
        data.slice(0, 30).forEach((item, i) => {
          console.log(`[${i}]`, typeof item, JSON.stringify(item).substring(0, 60));
        });
      }

    } catch (e) {
      console.log("❌ 解析错误:", e.message);
    }
  }

} catch (e) {
  console.log("❌ 网络错误:", e.message);
}
