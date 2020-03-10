import { Db, ObjectId } from 'mongodb';
import { Board } from '../util/trello';

const SYNC_COLLECTION = 'sync';

export interface Sync {
  id: string,
  source: Board,
  target: Board,
  labels: string[],
  lastSync?: number
}

export default (db: Db) => ({
  all: (): Promise<Sync[]> =>
    db.collection(SYNC_COLLECTION)
      .find()
      .toArray()
      .then(docs => docs
        .map(({ _id, ...doc }) => ({
          id: _id,
          ...doc,
        }))),

  create: async (source: Board, target: Board, labels: string[]): Promise<Sync> => {
    const r = await db.collection(SYNC_COLLECTION)
      .insertOne({
        source,
        target,
        labels,
        lastSync: null,
      });
    return {
      id: r.insertedId,
      source,
      target,
      labels,
      lastSync: null,
    };
  },

  delete: async (id: string): Promise<boolean> => {
    const { deletedCount } = await db.collection(SYNC_COLLECTION).deleteOne({ _id: new ObjectId(id) });
    return deletedCount === 1;
  },
});
