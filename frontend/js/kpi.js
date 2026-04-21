function formatCurrency(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

function updateTotalRevenue(data) {
  const total = data.reduce((sum, item) => {
    const revenue = parseFloat(item.chiffre_affaires) || 0;
    return sum + revenue;
  }, 0);
  
  const element = document.getElementById('total-revenue');
  if (element) {
    element.textContent = formatCurrency(total);
  }
}

// Fonction appelée après l'import du CSV
function onDataImported(csvData) {
  // Supposant que csvData est un array d'objets avec les colonnes du CSV
  updateTotalRevenue(csvData);
}