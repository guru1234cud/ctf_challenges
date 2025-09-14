// Minimal login page JS — automatically parses JSON-like inputs
const form = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

function tryParseIfJson(s) {
  if (typeof s !== 'string') return s;
  const t = s.trim();
  if (t.startsWith('{') || t.startsWith('[')) {
    try { return JSON.parse(t); } catch (e) { return s; }
  }
  return s;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const rawU = usernameInput.value;
  const rawP = passwordInput.value;

  const payload = {
    username: tryParseIfJson(rawU),
    password: tryParseIfJson(rawP)
  };

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const j = await res.json();

    if (j.success) {
      alert('Login successful!');
      if (j.redirect) window.location = j.redirect;
    } else {
      alert('Login failed: ' + (j.message || 'Invalid credentials'));
    }
  } catch (err) {
    alert('Network error');
  }
});
