import { Request, Response } from "express-serve-static-core";

import getMongoClient from '../util/mongo-client';

import SyncModel from '../db/sync';
import MonitorModel from '../db/monitor';

export default async (req: Request, res: Response): Promise<void> => {
  const client = await getMongoClient();
  try {
    const db = client.db();
    const Sync = SyncModel(db);
    const Monitor = MonitorModel(db);
    res.render('index', {
      title: 'Trello Sync / Clone',
      user: req.user,
      syncs: await Sync.all(),
      monitors: await Monitor.all(),
    });
  } catch (err) {
    console.log('err', err);
  } finally {
    client.close();
  }
};
