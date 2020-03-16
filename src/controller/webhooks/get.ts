import { Request, Response } from "express-serve-static-core";

export default async (req: Request, res: Response): Promise<void> =>
  res.render('webhooks', {
    title: 'My Trello Webhooks',
    user: req.user,
    webhooks: await req.trello.webhooks(),
  });
