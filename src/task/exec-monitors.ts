import flatMap from 'lodash.flatmap';
import Bluebird from 'bluebird';

import getMongoClient from '../util/mongo-client';
import TrelloApi from '../trello';
import cloneBoard from './clone-board';

import MonitorModel, { Monitor } from '../db/monitor';
import UserModel, { User } from '../db/user';
import SyncModel, { Sync } from '../db/sync';

export default async () => {
  const client = await getMongoClient();
  try {
    const db = client.db();
    const Monitor = MonitorModel(db);
    const User = UserModel(db);
    const Sync = SyncModel(db);

    const monitors = await Monitor.due();

    const clonesAndTouches = flatMap(monitors, async (monitor: Monitor) => {        
      const user = await User.find(monitor.userId); // we'll use the api token of the user who set up this monitor 
      const syncs = await Sync.allForSource(monitor.board.id); // all syncs that involve this board as the source
      const trello = TrelloApi(user.token);
      return flatMap(syncs, sync => [
        cloneBoard(trello)(
          sync.source.id,
          sync.target.id,
          sync.labels,
        ),
        Sync.touch(sync.id),
      ]);
    });

    return Bluebird.mapSeries(clonesAndTouches, x => x);
  } catch (err) {
    console.error('exec-monitors', err);
    throw new Error(err);
  } finally {
    client.close();
  }
};
