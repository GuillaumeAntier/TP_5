class TableViewer {
  constructor(containerId = "table-container") {
    this.container = document.getElementById(containerId);
    this.currentPage = 1;
    this.rowsPerPage = 10;
    this.data = null;
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.getElementById("prev-btn").addEventListener("click", () => this.previousPage());
    document.getElementById("next-btn").addEventListener("click", () => this.nextPage());
  }

  displayData(data) {
    this.data = data;
    this.currentPage = 1;
    this.renderTable();
    this.updateMetadata();
    this.updatePagination();
  }

  renderTable() {
    const { headers, rows } = this.data;
    
    // Rendu en-têtes
    const thead = document.getElementById("table-head");
    thead.innerHTML = `<tr>${headers.map(h => `<th>${this.escapeHtml(h)}</th>`).join("")}</tr>`;
    
    // Rendu lignes paginées
    const tbody = document.getElementById("table-body");
    tbody.innerHTML = "";
    
    const startIdx = (this.currentPage - 1) * this.rowsPerPage;
    const endIdx = startIdx + this.rowsPerPage;
    const paginatedRows = rows.slice(startIdx, endIdx);
    
    paginatedRows.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = headers.map(h => `<td>${this.escapeHtml(row[h] || "")}</td>`).join("");
      tbody.appendChild(tr);
    });
  }

  updateMetadata() {
    const { headers, rows } = this.data;
    document.getElementById("row-count").textContent = `Lignes: ${rows.length}`;
    document.getElementById("column-count").textContent = `Colonnes: ${headers.length}`;
  }

  updatePagination() {
    const totalPages = Math.ceil(this.data.rows.length / this.rowsPerPage);
    document.getElementById("page-info").textContent = `Page ${this.currentPage} / ${totalPages}`;
    document.getElementById("prev-btn").disabled = this.currentPage === 1;
    document.getElementById("next-btn").disabled = this.currentPage === totalPages;
  }

  nextPage() {
    const totalPages = Math.ceil(this.data.rows.length / this.rowsPerPage);
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.renderTable();
      this.updatePagination();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.renderTable();
      this.updatePagination();
    }
  }

  escapeHtml(text) {
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }
}

const tableViewer = new TableViewer();