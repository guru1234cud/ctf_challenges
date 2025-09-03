const express = require("express");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "./frontend"))); // serve static frontend

// Load RSA keys
const PRIVATE_KEY = fs.readFileSync(path.join(__dirname, "private.pem"), "utf8");
const PUBLIC_KEY = fs.readFileSync(path.join(__dirname, "public.pem"), "utf8");

app.get("/public.pem", (req, res) => {
  res.type("application/x-pem-file");
  res.send(PUBLIC_KEY);
});
// Fake users DB
const users = {
  user: { password: "user123", role: "user" },
  admin: { password: "admin123", role: "admin" } // hidden
};

// Login → issues JWT (RS256)
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (users[username] && users[username].password === password) {
    // Always sign with RS256 (so players think it's secure)
    const token = jwt.sign(
      { username, role: users[username].role },
      PRIVATE_KEY,
      { algorithm: "RS256" }
    );
    return res.json({ token });
  }

  res.status(401).json({ error: "Invalid credentials" });
});

// Protected flag route
app.get("/flag", (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(403).send("No token provided");

  const token = authHeader.split(" ")[1];
  let decoded;

  try {
    // Extract header without verifying
    const header = JSON.parse(Buffer.from(token.split(".")[0], "base64").toString());
    const alg = header.alg;

    if (alg === "RS256") {
      // Proper verification
      decoded = jwt.verify(token, PUBLIC_KEY, { algorithms: ["RS256"] });
    } else if (alg === "HS256") {
      // ❌ Vulnerability: uses PUBLIC KEY as HMAC secret
      decoded = jwt.verify(token, PUBLIC_KEY, { algorithms: ["HS256"] });
    } else {
      return res.status(400).send("Unsupported algorithm");
    }

    if (decoded.role === "admin") {
      const flag = fs.readFileSync(path.join(__dirname, "flag.txt"), "utf8");
      return res.json({
        flag:`${flag}`
      });
    } else {
      return res.send("❌ You must be admin to access this route.");
    }
  } catch (err) {
    return res.status(401).send("Invalid token");
  }
});

app.listen(3000, () => console.log("🚩 CTF backend running at http://localhost:3000"));
