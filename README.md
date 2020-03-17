# Trello Clone

This project allows you to sync a subset of cards from one board to another, either automatically or manually.

### Deploying on Heroku

1. Open https://trello.com/app-key and take note of your API key and secret (scroll all the way down).
2. Deploy your app on heroku by clicking the following button. For the deployed URL environment variable, use `https://[app-name].herokuapp.com`. Do not add a trailing slash!

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

3. Add the deployed URL under Allowed Origins on https://trello.com/app-key. As with the deployed URL, do not include a trailing slash.

### Using trello-clone

- Visit the deployed URL to get started. You will be asked to authenticate via Trello; this authentication will be stored in a cookie. Subsequent users will have to visit the invite URL (available on the home page) in order to connect with this app instance.

- Conceptually, monitors wrap Trello webhooks. In order to automatically trigger syncs, you need both a *monitor* for the source board, and a *sync* that will clone the source board to a target board. One *monitor* can trigger many *sync*s (one for each *sync* that has the monitored board as its source!).

- The `/webhooks` route will allow you to manage *all* of your Trello webhooks, not just the ones created by trello-clone.

- Currently, the cron job only checks every minute for modified monitored boards.

### Dev notes

- Typescript linting in 2020: https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/README.md

