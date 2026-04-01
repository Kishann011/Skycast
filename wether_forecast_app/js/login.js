(function () {
  const SESSION_KEY = "skycastUser";
  const form = document.getElementById("login-form");
  const status = document.getElementById("login-status");
  const logoutBtn = document.getElementById("logout-btn");

  function readSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function render() {
    const s = readSession();
    if (s && s.email) {
      status.textContent = `Signed in as ${s.email}`;
      logoutBtn.style.display = "block";
    } else {
      status.textContent = "";
      logoutBtn.style.display = "none";
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    if (!email || !password) {
      status.textContent = "Please fill in both fields.";
      return;
    }
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ email, savedAt: Date.now() })
    );
    status.textContent = `Welcome back, ${email}`;
    logoutBtn.style.display = "block";
    form.reset();
  });

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem(SESSION_KEY);
    status.textContent = "You are logged out.";
    logoutBtn.style.display = "none";
  });

  render();
})();
