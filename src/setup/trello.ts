import { IRouter } from "express";

import TrelloApi from '../trello';

export default (app: IRouter) =>
  app.use((req, res, next) => {
    if (!req.user) {
      return res.redirect('/auth/login');
    }
    req.trello = TrelloApi(req.user.token);
    return next();
  });

