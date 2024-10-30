document.getElementById("downloadForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const url = document.getElementById("url").value;
    const type = document.getElementById("type").value;
    const quality = document.getElementById("quality").value;

    document.getElementById("statusMessage").textContent = "ダウンロード中...";

    try {
        // RenderにデプロイしたバックエンドのURL
        const backendUrl = "https://yt-dl-server-6gaf.onrender.com/download";

        const response = await fetch(backendUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url, type, quality })
        });

        if (response.ok) {
            const blob = await response.blob();
            // サーバーから送信されたファイル名を取得する
            const contentDisposition = response.headers.get("Content-Disposition");
            const fileName = contentDisposition
                ? contentDisposition.match(/filename="(.+)"/)[1]
                : type === "video" ? "downloaded_video.mp4" : "downloaded_audio.mp3";

            // ファイルのダウンロードリンクを作成
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = fileName;
            link.click();

            document.getElementById("statusMessage").textContent = "ダウンロード完了!";
        } else if (response.status === 429) {
            document.getElementById("statusMessage").textContent = "サーバーがビジー状態です。少し待って再試行してください。";
        } else {
            document.getElementById("statusMessage").textContent = "エラーが発生しました。";
        }
    } catch (error) {
        document.getElementById("statusMessage").textContent = "通信エラーが発生しました。";
        console.error("Error:", error);
    }
});
