// Vérification de l'authentification au chargement
window.addEventListener("load", () => {
  const token = localStorage.getItem("admin_token");
  const username = localStorage.getItem("admin_username");

  if (!token) {
    // Redirection si non authentifié
    window.location.href = "admin-login.html";
    return;
  }

  // Afficher le nom d'utilisateur
  document.getElementById("admin-name").textContent = `Connecté en tant que: ${username}`;
});

// Bouton de déconnexion
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_username");
  window.location.href = "admin-login.html";
});