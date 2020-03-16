import { Request, Response } from "express-serve-static-core";

import getMongoClient from '../../util/mongo-client';
import MonitorModel from '../../db/monitor';

export default async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const client = await getMongoClient();
  try {
    const Monitor = MonitorModel(client.db());
    await Monitor.delete(id);
  } finally {
    client.close();
  }

  return res.redirect('/');
};
