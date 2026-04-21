class TableViewer {
  constructor(containerId = "table-container") {
    this.container = document.getElementById(containerId);
    this.currentPage = 1;
    this.rowsPerPage = 10;
    this.data = null;
    this.filteredData = null;
    this.selectedSegment = "";
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.getElementById("prev-btn").addEventListener("click", () => this.previousPage());
    document.getElementById("next-btn").addEventListener("click", () => this.nextPage());
    document.getElementById("segment-filter").addEventListener("change", (e) => this.applyFilter(e.target.value));
  }

  displayData(data) {
    this.data = data;
    this.filteredData = data;
    this.currentPage = 1;
    this.populateSegmentFilter();
    this.renderTable();
    this.updateMetadata();
    this.updatePagination();
    document.getElementById("filter-bar").hidden = false;
  }

  populateSegmentFilter() {
    const segmentFilter = document.getElementById("segment-filter");
    const segments = new Set(this.data.rows.map(row => row.segment).filter(s => s));
    
    // Récupère les options existantes sauf la première
    const existingOptions = Array.from(segmentFilter.options).slice(1);
    
    // Ajoute les nouveaux segments
    Array.from(segments).sort().forEach(segment => {
      if (!existingOptions.some(opt => opt.value === segment)) {
        const option = document.createElement("option");
        option.value = segment;
        option.textContent = segment;
        segmentFilter.appendChild(option);
      }
    });
  }

  applyFilter(segment) {
    this.selectedSegment = segment;
    this.currentPage = 1;
    
    if (segment === "") {
      this.filteredData = this.data;
    } else {
      this.filteredData = {
        headers: this.data.headers,
        rows: this.data.rows.filter(row => row.segment === segment)
      };
    }
    
    this.renderTable();
    this.updateMetadata();
    this.updatePagination();
  }

  renderTable() {
    const { headers, rows } = this.filteredData;
    
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
    const { headers, rows } = this.filteredData;
    document.getElementById("row-count").textContent = `Lignes: ${rows.length}`;
    document.getElementById("column-count").textContent = `Colonnes: ${headers.length}`;
  }

  updatePagination() {
    const totalPages = Math.ceil(this.filteredData.rows.length / this.rowsPerPage);
    document.getElementById("page-info").textContent = `Page ${this.currentPage} / ${totalPages}`;
    document.getElementById("prev-btn").disabled = this.currentPage === 1;
    document.getElementById("next-btn").disabled = this.currentPage === totalPages || totalPages === 0;
  }

  nextPage() {
    const totalPages = Math.ceil(this.filteredData.rows.length / this.rowsPerPage);
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