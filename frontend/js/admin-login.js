const loginForm = document.getElementById("admin-login-form");
const errorMessage = document.getElementById("error-message");

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin";

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // Vérification des identifiants
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Stockage du token dans localStorage
    localStorage.setItem("admin_token", "authenticated");
    localStorage.setItem("admin_username", username);
    
    // Redirection vers le panneau admin
    window.location.href = "admin.html";
  } else {
    errorMessage.textContent = "❌ Identifiant ou mot de passe incorrect";
    errorMessage.style.display = "block";
    
    // Effacer le message après 3 secondes
    setTimeout(() => {
      errorMessage.style.display = "none";
    }, 3000);
  }
});