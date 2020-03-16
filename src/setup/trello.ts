import { Application } from "express";

import TrelloApi from '../trello';

export default (app: Application) =>
  app.use((req, res, next) => {req
    if (req.user) {
      req.trello = TrelloApi(req.user.token);
    }
    return next();
  });
