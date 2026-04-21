const uploadZone = document.getElementById("uploadZone");
const fileInput = document.getElementById("fileInput");
const fileNameDiv = document.getElementById("fileName");
const uploadBtn = document.getElementById("uploadBtn");
const messageDiv = document.getElementById("message");

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

// Clic sur la zone pour ouvrir le sélecteur
uploadZone.addEventListener("click", () => {
    fileInput.click();
});

function handleFileSelect(file) {
    if (!file.name.endsWith(".csv")) {
        showMessage("Seuls les fichiers .csv sont acceptés.", "error");
        return;
    }
    
    if (file.size === 0) {
        showMessage("Le fichier sélectionné est vide et ne peut pas être importé.", "error");
        return;
    }

    selectedFile = file;
    fileNameDiv.textContent = `Fichier sélectionné : ${file.name} (${formatSize(file.size)})`;
    fileNameDiv.hidden = false;
    uploadBtn.hidden = false;
    messageDiv.hidden = true;
}

function formatSize(bytes) {
    if (bytes < 1024) return bytes + " o";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " Ko";
    return (bytes / (1024 * 1024)).toFixed(1) + " Mo";
}

// Upload
uploadBtn.addEventListener("click", uploadFile);

async function uploadFile() {
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
        
        // Charger et afficher la table complète directement
        loadFullData(data.file_id);
    } catch (err) {
        showMessage("Erreur de connexion au serveur.", "error");
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = "Importer";
    }
}

async function loadFullData(fileId) {
    try {
        const response = await fetch(`/api/data/${fileId}`);
        const data = await response.json();
        
        // Afficher la table avec pagination
        document.getElementById("table-container").hidden = false;
        updateTotalClientsKpi(data);
        updateRiskKpi(data);
        tableViewer.displayData({
            headers: data.headers,
            rows: data.rows,
        });
    } catch (error) {
        showMessage("Erreur lors du chargement des données: " + error.message, "error");
    }
}

function updateTotalClientsKpi(data) {
    const kpiBar = document.getElementById("kpi-bar");
    const kpiTotal = document.getElementById("kpi-total-count");
    if (!kpiBar || !kpiTotal) return;

    const rows = Array.isArray(data.rows) ? data.rows : [];
    kpiTotal.textContent = String(rows.length);
    kpiBar.hidden = false;
}

function updateRiskKpi(data) {
    const kpiBar = document.getElementById("kpi-bar");
    const kpiValue = document.getElementById("kpi-risk-count");
    if (!kpiBar || !kpiValue) return;

    const riskHeader = (data.headers || []).find(
        (h) => normalizeText(h) === "risque_churn"
    );
    if (!riskHeader) {
        kpiBar.hidden = true;
        return;
    }

    const rows = Array.isArray(data.rows) ? data.rows : [];
    const riskCount = rows.reduce((acc, row) => {
        const raw = row?.[riskHeader];
        const value = normalizeText(raw);
        const isHigh = value === "eleve" || value === "élevé";
        return acc + (isHigh ? 1 : 0);
    }, 0);

    kpiValue.textContent = String(riskCount);
    kpiBar.hidden = false;
}

function normalizeText(input) {
    return String(input ?? "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.hidden = false;
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
