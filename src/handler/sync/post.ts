import { Request, Response } from "express-serve-static-core";

import getMongoClient from '../../util/mongo-client';
import SyncModel from '../../db/sync';

import CloneBoard from '../../task/clone-board';

export default async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const cloneBoard = CloneBoard(req.trello);

  const client = await getMongoClient();
  try {
    const Sync = SyncModel(client.db());
    const sync = await Sync.get(id);
    console.log(`Syncing ${sync.source.name} to ${sync.target.name}...`);
    try {
      await cloneBoard(sync.source.id, sync.target.id, sync.labels);
      await Sync.touch(id);
      console.log('Done!');
    } catch (err) {
      console.error(err);
      console.log("error; see above");
    }
  } finally {
    client.close();
  }

  return res.redirect('/');
};
