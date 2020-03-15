import Bluebird from 'bluebird';

import getMongoClient from '../util/mongo-client';
import MonitorModel from '../db/monitor';
import UserModel from '../db/monitor';
import SyncModel from '../db/monitor';

export default async () => {
  const client = await getMongoClient();
  const db = client.db();
  const rv = await Bluebird.map(
    [MonitorModel, UserModel],
    model => model(db).setup(),
  );
  client.close();
  return rv;
};

