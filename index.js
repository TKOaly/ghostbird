require("dotenv").config();
const express = require("express");
const app = express();

const VERSION = require("./package.json").version;
const PORT = process?.env?.PORT ?? 3000;

app.get("/", (_req, res) => {
  res.send(`harmaarouva v${VERSION}`);
});

app.post("/published", (req, res) => {
  console.log(req);
  res.send(`harmaarouva ok`);
});

app.listen(PORT, () => {
  console.log(`[harmaarouva] listening on port ${PORT}`);
});
