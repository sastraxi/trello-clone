import { Request, Response } from "express-serve-static-core";

import getMongoClient from '../../util/mongo-client';
import SyncModel from '../../db/sync';

export default async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const client = await getMongoClient();
  try {
    const Sync = SyncModel(client.db());
    await Sync.delete(id);
  } finally {
    client.close();
  }

  return res.redirect('/');
};
