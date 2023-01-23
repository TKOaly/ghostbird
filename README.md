# harmaarouva

A simple Ghost webhook -> Telegram backend

## message template

Possible replacements:
`%TITLE%`, `%EXCERPT%` (prefer URL preview), `%AUTHORS%` (comma separated), `%AUTHOR%` (primary author), `%TAGS%` (comma separated), `%TAG%` (primary tag), `%URL%`

The message is processed as Telegram HTML ([Telegram documentation](https://core.telegram.org/bots/api#html-style))  
**Remember: `&lt;`, `&gt;`, `&amp;` and `&quot;` instead of `<>&"` when not in HTML tags.**

## developing

Developing is tricky, as we need a local Ghost instance to test webhooks.  
Luckily I've spent a couple of hours setting up a docker-compose file that brings up a local test environment.  
Unfortunately it's currently missing database seeding or a sample database.

1. clone this repository
2. `docker-compose up`
3. navigate to localhost:3001/ghost
4. set up blog with any information
5. configure webhook (ghost settings -> integrations -> custom)
   - add a webhook with `event: Post published` and `URL: http://vendla:willebrand@harmaarouva.localhost:3000/published`
6. test webhook by publishing a post in ghost

The harmaarouva app will automatically update as you develop locally, as it reads the docker host's `index.js` and runs with `nodemon` for automatic reloads.
