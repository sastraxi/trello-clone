import { Request, Response } from "express-serve-static-core";

export default async (req: Request, res: Response): Promise<void> => {
  return res.render('new-monitor', {
    title: 'New Monitored Board',
    user: req.user,
    boards: await req.trello.boards(),
  });
};
