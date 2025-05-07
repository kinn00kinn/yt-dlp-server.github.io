
document.getElementById("downloadForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const url = document.getElementById("url").value;
    const type = document.getElementById("type").value;
    const quality = document.getElementById("quality").value;

    const statusMessage = document.getElementById("statusMessage");
    const progressBar = document.getElementById("progressBar");
    const progressContainer = document.getElementById("progressContainer");

    statusMessage.textContent = "準備中...";
    progressContainer.style.display = "block";
    progressBar.value = 0;

    try {
        const backendUrl = "https://yt-dl-server-6gaf.onrender.com/download";

        const response = await fetch(backendUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url, type, quality, cookies })
        });

        if (response.status === 429) {
            statusMessage.textContent = "サーバーがビジー状態です。しばらく待って再試行してください。";
            progressContainer.style.display = "none";
            return;
        }

        if (!response.ok) {
            const errorMsg = await response.json();
            statusMessage.textContent = `エラー: ${errorMsg.error || "不明なエラー"}`;
            progressContainer.style.display = "none";
            return;
        }

        const contentDisposition = response.headers.get("Content-Disposition");
        const fileName = contentDisposition
            ? contentDisposition.match(/filename="(.+?)"/)?.[1] ?? "downloaded_file"
            : type === "video" ? "downloaded_video.mp4" : "downloaded_audio.mp3";

        const contentLength = response.headers.get("Content-Length");
        const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;

        const reader = response.body.getReader();
        const chunks = [];
        let receivedLength = 0;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            receivedLength += value.length;

            if (totalBytes > 0) {
                progressBar.value = (receivedLength / totalBytes) * 100;
            }
        }

        const blob = new Blob(chunks);
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        statusMessage.textContent = `ダウンロード完了！（${(blob.size / 1024 / 1024).toFixed(2)} MB）`;
        progressBar.value = 100;

    } catch (error) {
        console.error("通信エラー:", error);
        statusMessage.textContent = "通信エラーが発生しました。";
    } finally {
        setTimeout(() => {
            progressContainer.style.display = "none";
            progressBar.value = 0;
        }, 5000); // 5秒後に非表示
    }
});

