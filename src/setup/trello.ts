import { IRouter } from "express";

import TrelloApi from '../util/trello-api';

export default (app: IRouter) =>
  app.use((req, res, next) => {
    if (req.user) {
      req.trello = TrelloApi(req.user.token);
    }
    next();
  });
