import { Request, Response } from "express-serve-static-core";

export default async (req: Request, res: Response): Promise<Response | void> => {
  const { id } = req.params;
  try {
    await req.trello.deleteWebhook(id);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Could not delete webhook');
  }
  return res.redirect('/webhooks');
};
