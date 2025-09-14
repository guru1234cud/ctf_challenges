const express = require("express");
const fileUpload = require("express-fileupload");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 5000;


app.use(fileUpload());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


if (!fs.existsSync(path.join(__dirname, "uploads"))) {
  fs.mkdirSync(path.join(__dirname, "uploads"));
}

let flag = "CTF{UNRESTRICTED_FILE_UPLOAD_WINNER}";
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>CTF Upload Challenge</title>
      <style>
        body { font-family: Arial, sans-serif; background: #f9fafb; color: #333; padding: 40px; }
        .container { max-width: 500px; margin: auto; background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        h1 { text-align: center; color: #444; }
        form { display: flex; flex-direction: column; gap: 15px; }
        input[type="file"] { padding: 10px; border: 1px solid #ddd; border-radius: 8px; }
        button { padding: 12px; background: #2563eb; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; }
        button:hover { background: #1d4ed8; }
        .note { font-size: 14px; color: #777; margin-top: 10px; }
        .uploads { margin-top: 20px; padding: 15px; border-top: 1px solid #eee; }
        .uploads a { display: block; color: #2563eb; margin-top: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Upload Profile Picture</h1>
        <form method="POST" action="/upload" enctype="multipart/form-data">
          <input type="file" name="avatar" required />
          <button type="submit">Upload</button>
        </form>
        <p class="note">Allowed extensions: <b>.png, .jpg</b></p>
        <div class="uploads">
          <h3>Uploaded Files</h3>
          ${fs.readdirSync(path.join(__dirname, "uploads"))
            .map(f => `<a href="/uploads/${f}" target="_blank">${f}</a>`)
            .join("") || "<p>No files yet.</p>"}
        </div>
      </div>
    </body>
    </html>
  `);
});

// Handle uploads
app.post("/upload", (req, res) => {
  if (!req.files || !req.files.avatar) {
    return res.send("No file uploaded.");
  }

  let avatar = req.files.avatar;
  let uploadPath = path.join(__dirname, "uploads", avatar.name);

  //  Vulnerability: Only checks extension
  if (!avatar.name.endsWith(".png") && !avatar.name.endsWith(".jpg")) {
    return res.send("Only .png and .jpg allowed!");
  }

  avatar.mv(uploadPath, (err) => {
    if (err) return res.status(500).send("Upload failed.");
    res.redirect("/");
  });
});

// Secret flag endpoint
app.get("/dibfdifbgh", (req, res) => {
  res.send(flag);
});

app.listen(PORT, () => {
  console.log(`CTF challenge running on http://localhost:${PORT}`);
});
