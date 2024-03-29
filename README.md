# Trello Clone

This project allows you to sync a subset of cards from one board to another, either automatically or manually.

### Deploying on Heroku

1. Open https://trello.com/app-key and take note of your API key and secret (scroll all the way down)
2. Deploy your app on heroku by clicking the following button. For the deployed URL environment variable, use `https://[app-name].herokuapp.com`. Do not add a trailing slash!

   [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

3. Add the deployed URL under Allowed Origins on https://trello.com/app-key. As with the deployed URL, do not include a trailing slash

4. Visit `https://[app-name].herokuapp.com` in a browser

### Using trello-clone

- You will need a Trello account; the authenticated token will be stored in a MongoDB collection along with your Trello profile.

- The first user to authorize and log into this deployment of trello-clone will trigger the generation of an invitation code. Subsequent users will have to visit the invite URL (available on the home page) in order to connect with this app instance.
  
  - e.g. share it in slack, discord; wherever fine text is transmitted

- The core `Sync` concept models a relationship `(source board, label colours) -> target board`. Any card with a label coloured with one of the synced label colours will be cloned onto the target board whenever that sync is performed.

  - Everything on the card is copied, with the exception of labels

  - The new cards maintain a link to their source card. This does not make the source cards visible to anyone who can access the target board, as Trello's access control rules still apply

  - Due to rate limits and an inextremely inefficient use of Trello's API, syncing has a throughput of around `3 cards/s`

- Conceptually, a `Monitor` wraps a Trello webhook. In order to automatically trigger syncs, you need both a *monitor* for the source board, and a *sync* that will clone the source board to a target board. One *monitor* can trigger many *sync*s (one for each *sync* that has the monitored board as its source!).

  - The cron job only checks every minute for modified monitored boards, so it may take `delaySeconds + 60` seconds to actually trigger syncs

- The `/webhooks` route will allow you to manage *all* of your Trello webhooks, not just the ones created by (this instance of) trello-clone. 

# Development notes

- Typescript linting in 2020: https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/README.md

