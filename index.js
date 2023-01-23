require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const basicAuth = require("express-basic-auth");

const app = express();
app.use(bodyParser.json());

// Basic HTTP authorization
const USER = process.env.AUTH_USER;
const PASS = process.env.AUTH_PASSWORD;
if (!USER || !PASS) {
  console.error(
    "[harmaarouva] require env variables AUTH_USER and AUTH_PASSWORD for basic http auth"
  );
  process.exit(1);
}
app.use(
  basicAuth({
    users: {
      [process.env.AUTH_USER]: process.env.AUTH_PASSWORD,
    },
  })
);

const VERSION = require("./package.json").version;
const PORT = process?.env?.PORT ?? 3000;

app.get("/", (_req, res) => {
  res.send(`harmaarouva v${VERSION}`);
});

app.post("/published", (req, res) => {
  console.log(req.body);
  res.send(`harmaarouva ok`);
});

app.listen(PORT, () => {
  console.log(`[harmaarouva] listening on port ${PORT}`);
});
