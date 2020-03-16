import { Request, Response } from "express-serve-static-core";

export default async (req: Request, res: Response): Promise<void> =>
  res.render('new-sync', {
    title: 'New Trello Sync',
    user: req.user,
    boards: await req.trello.boards(),
  });
