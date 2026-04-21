const uploadZone = document.getElementById("uploadZone");
const fileInput = document.getElementById("fileInput");
const fileNameDiv = document.getElementById("fileName");
const uploadBtn = document.getElementById("uploadBtn");
const messageDiv = document.getElementById("message");
const previewSection = document.getElementById("previewSection");
const previewHead = document.getElementById("previewHead");
const previewBody = document.getElementById("previewBody");
const rowCount = document.getElementById("rowCount");

let selectedFile = null;

// Drag & drop
uploadZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadZone.classList.add("drag-over");
});

uploadZone.addEventListener("dragleave", () => {
    uploadZone.classList.remove("drag-over");
});

uploadZone.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadZone.classList.remove("drag-over");
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
});

// Sélection via bouton
fileInput.addEventListener("change", () => {
    if (fileInput.files[0]) handleFileSelect(fileInput.files[0]);
});

function handleFileSelect(file) {
    if (!file.name.endsWith(".csv")) {
        showMessage("Seuls les fichiers .csv sont acceptés.", "error");
        return;
    }

    selectedFile = file;
    fileNameDiv.textContent = `Fichier sélectionné : ${file.name} (${formatSize(file.size)})`;
    fileNameDiv.hidden = false;
    uploadBtn.hidden = false;
    messageDiv.hidden = true;
    previewSection.hidden = true;
}

function formatSize(bytes) {
    if (bytes < 1024) return bytes + " o";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " Ko";
    return (bytes / (1024 * 1024)).toFixed(1) + " Mo";
}

// Upload
uploadBtn.addEventListener("click", async () => {
    if (!selectedFile) return;

    uploadBtn.disabled = true;
    uploadBtn.textContent = "Import en cours...";

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
        const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(data.error, "error");
            return;
        }

        showMessage(data.message, "success");
        renderPreview(data.headers, data.preview, data.row_count);
    } catch (err) {
        showMessage("Erreur de connexion au serveur.", "error");
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = "Importer";
    }
});

function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.hidden = false;
}

function renderPreview(headers, rows, total) {
    previewSection.hidden = false;
    rowCount.textContent = `${total} ligne(s) au total — aperçu des 5 premières :`;

    previewHead.innerHTML = "<tr>" + headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("") + "</tr>";

    previewBody.innerHTML = rows
        .map(
            (row) =>
                "<tr>" + headers.map((h) => `<td>${escapeHtml(row[h] || "")}</td>`).join("") + "</tr>"
        )
        .join("");
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
