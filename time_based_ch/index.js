const express = require("express");
const app = express();
const port = 6000;

// The hidden flag (you can change this)
const FLAG = "CTF{timing_attack_master}";

// Route to get character timing
app.get("/flag/:index", async (req, res) => {
  const index = parseInt(req.params.index);

  // Invalid index check
  if (isNaN(index) || index < 0 || index >= FLAG.length) {
    return res.status(400).send("not here");
  }

  // Get ASCII of flag character
  const ascii = FLAG.charCodeAt(index);

  // Delay = ASCII * 100 ms (scaled to avoid jitter issues)
  const delay = ascii * 100;

  await new Promise(resolve => setTimeout(resolve, delay));

  // Send back dummy response (no clue in body)
  res.send("might be 404");
});

// Simple homepage
app.get("/", (req, res) => {
  res.send("Welcome to the challenge! Try exploring /flag/{index}");
});
app.use((req, res) => {
  res.status(404).send(
    "404 Not Found… nothing interesting here, or maybe there is?"
  );
});

app.listen(port, () => {
  console.log(`Timing challenge running at http://localhost:${port}`);
});
