import { Request, Response } from "express-serve-static-core";

import getMongoClient from '../util/mongo-client';

import SyncModel from '../db/sync';
import MonitorModel from '../db/monitor';
import InviteCodeModel from '../db/invite-code';

import deployedUrl from '../util/url';

export default async (req: Request, res: Response): Promise<void> => {
  const client = await getMongoClient();
  try {
    const db = client.db();
    const Sync = SyncModel(db);
    const Monitor = MonitorModel(db);
    const InviteCode = InviteCodeModel(db);

    const codes = (await InviteCode.all()).map(code => code.code);

    res.render('index', {
      title: 'Trello Sync / Clone',
      user: req.user,
      syncs: await Sync.all(),
      monitors: await Monitor.all(),
      inviteUrl: codes.length > 0
        ? `${deployedUrl}/i/${codes[0]}`
        : null,
    });
  } catch (err) {
    console.error('err', err);
  } finally {
    client.close();
  }
};
