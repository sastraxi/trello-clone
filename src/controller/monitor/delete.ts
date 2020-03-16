import { Request, Response } from "express-serve-static-core";

import getMongoClient from '../../util/mongo-client';
import MonitorModel from '../../db/monitor';

export default async (req: Request, res: Response): Promise<Response | void> => {
  const { id } = req.params;

  const client = await getMongoClient();
  try {
    const Monitor = MonitorModel(client.db());    
    const monitor = await Monitor.find(id);

    console.log(JSON.stringify(monitor, null, 2));

    await req.trello.deleteWebhook(monitor.webhookId);
    await Monitor.delete(id);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Unable to delete webhook / monitor');
  } finally {
    client.close();
  }

  return res.redirect('/');
};
