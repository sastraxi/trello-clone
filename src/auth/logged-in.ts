import { Request, Response } from "express";

export default (req: Request, res: Response, next: any): any => {
  if (!req.user) {
    return res.redirect('/auth/login');
  }
  return next();
};
