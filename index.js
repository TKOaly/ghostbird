require("dotenv").config();
const fs = require("fs");
const axios = require("axios");
const express = require("express");
const bodyParser = require("body-parser");
const basicAuth = require("express-basic-auth");

const VERSION = require("./package.json").version;
const PORT = process.env.PORT ?? 3000;

const app = express();
app.get("/", (_req, res) => {
  res.send(`ghostbird v${VERSION}`);
});
app.use(bodyParser.json());

// Basic HTTP authorization
const USER = process.env.AUTH_USER;
const PASS = process.env.AUTH_PASSWORD;
if (!USER || !PASS) {
  console.error(
    "[ghostbird] require env variables AUTH_USER and AUTH_PASSWORD for basic http auth"
  );
  process.exit(1);
}
app.use(
  basicAuth({
    users: {
      [process.env.AUTH_USER]: process.env.AUTH_PASSWORD,
    },
    unauthorizedResponse: "Unauthorized",
    challenge: true,
  })
);
// For testing credentials
app.get("/auth", (_req, res) => {
  res.send(`ghostbird auth successful`);
});

// Telegram credentials
const TG_TOKEN = process.env.TG_TOKEN;
const TG_CHAT_ID = process.env.TG_CHAT_ID;
if (!TG_TOKEN) {
  console.error("[ghostbird] require env variables TG_TOKEN, TG_CHAT_ID");
  process.exit(1);
}
const TG_URL = `https://api.telegram.org/bot${TG_TOKEN}`;
// Template read
if (!fs.existsSync("./message.html")) {
  console.error("[ghostbird] require file message.html");
  process.exit(1);
}
const TEMPLATE = fs.readFileSync("./message.html", "utf-8");

// https://core.telegram.org/bots/api#html-style
function sanitize(string) {
  return string
    .replace("<", "&lt;")
    .replace(">", "&gt;")
    .replace("&", "&amp;")
    .replace('"', "&quot;");
}
function formatTemplate(template, post) {
  const authors = post.authors?.map((author) => author.name).join(", ") ?? "";
  const tags = post.tags?.map((tag) => tag.name).join(", ") ?? "";

  return template
    .replace("%TITLE%", sanitize(post.title ?? "<Unnamed post>"))
    .replace("%URL%", sanitize(post.url ?? "<No url>"))
    .replace(
      "%EXCERPT%",
      sanitize(post.customExcerpt ?? post.excerpt ?? "<No content>")
    )
    .replace("%AUTHORS%", sanitize(authors))
    .replace("%AUTHOR%", sanitize(post.primary_author?.name ?? "<No author>"))
    .replace("%TAGS%", sanitize(tags))
    .replace("%TAG%", sanitize(post.primary_tag?.name ?? ""));
}

app.post("/published", (req, res) => {
  const post = req?.body?.post?.current;

  if (!post) {
    console.error("[ghostbird] invalid post to publish");
    console.error(req.body);
    return res.status(400).send(`ghostbird fail: post.current not present`);
  }

  const text = formatTemplate(TEMPLATE, post);
  axios({
    method: "GET",
    url: `${TG_URL}/sendMessage`,
    data: {
      chat_id: TG_CHAT_ID,
      text,
      parse_mode: "HTML",
    },
  });

  res.send(`ghostbird ok`);
});

app.listen(PORT, () => {
  console.log(`[ghostbird] listening on port ${PORT}`);
});
