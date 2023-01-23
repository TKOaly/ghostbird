require("dotenv").config();
const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const basicAuth = require("express-basic-auth");

const app = express();
app.get("/", (_req, res) => {
  res.send(`harmaarouva v${VERSION}`);
});
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
    unauthorizedResponse: "Unauthorized",
  })
);

if (!fs.existsSync("./message.template")) {
  console.error("[harmaarouva] require file message.template");
  process.exit(1);
}
const TEMPLATE = fs.readFileSync("./message.template", "utf-8");

const VERSION = require("./package.json").version;
const PORT = process?.env?.PORT ?? 3000;

function formatTemplate(template, post) {
  const authors = post.authors?.map((author) => author.name).join(", ") ?? "";
  const tags = post.tags?.map((tag) => tag.name).join(", ") ?? "";

  return template
    .replace("%TITLE%", post.title ?? "<Unnamed post>")
    .replace("%URL%", post.url ?? "<No url>")
    .replace("%EXCERPT%", post.customExcerpt ?? post.excerpt ?? "<No content>")
    .replace("%AUTHORS%", authors)
    .replace("%AUTHOR%", post.primary_author.name ?? "<No author>")
    .replace("%TAGS%", tags)
    .replace("%TAG%", post.primary_tag.name ?? "");
}

app.post("/published", (req, res) => {
  const post = req?.body?.post?.current;

  if (!post) {
    console.error("[harmaarouva] invalid post to publish");
    console.error(req.body);
    return res.status(400).send(`harmaarouva fail: post.current not present`);
  }

  console.log(formatTemplate(TEMPLATE, post));

  res.send(`harmaarouva ok`);
});

app.listen(PORT, () => {
  console.log(`[harmaarouva] listening on port ${PORT}`);
});
