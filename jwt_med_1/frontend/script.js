let token = null;

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    token = data.token;

    if (token) {
      alert("✅ Logged in successfully.");
      getFlag();
    } else {
      console.log("❌ Login failed:", data);
    }
  } catch (err) {
    console.error("Error during login:", err);
  }
}

async function getFlag() {
  if (!token) {
    console.log("❌ No token, please login first!");
    return;
  }

  try {
    const res = await fetch("/flag", {
      headers: { Authorization: "Bearer " + token }
    });

    const data = await res.json();

    if (data.flag) {
      console.log("🚩 FLAG:", data.flag);  // <---- shows ONLY in console
    } else {
      console.log("❌ Could not fetch flag:", data);
    }
  } catch (err) {
    console.error("Error fetching flag:", err);
  }
}
