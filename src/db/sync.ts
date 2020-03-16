import { Db, ObjectId } from 'mongodb';
import { Board } from '../trello/definitions';

const SYNC_COLLECTION = 'sync';

export interface Sync {
  id: string;
  source: Board;
  target: Board;
  labels: string[];
  lastSync?: number;
}

const fromDb = ({ _id, ...doc }: any) => ({
  id: _id,
  ...doc,
});

export default (db: Db) => ({
  get: (id: string): Promise<Sync> =>
    db.collection(SYNC_COLLECTION)
      .findOne({ _id: new ObjectId(id) })
      .then(({ _id, ...doc }) => ({
        id: _id,
        ...doc,
      })),

  allForSource: (sourceId: string): Promise<Sync[]> =>
    db.collection(SYNC_COLLECTION)
      .find({ "source.id": sourceId })
      .toArray()
      .then(docs => docs.map(fromDb)),

  all: (): Promise<Sync[]> =>
    db.collection(SYNC_COLLECTION)
      .find()
      .toArray()
      .then(docs => docs.map(fromDb)),

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

  touch: async (id: string): Promise<number> =>
    db.collection(SYNC_COLLECTION)
      .updateOne(
        { _id: new ObjectId(id) },
        { $currentDate: { lastSync: true } },
      ).then(r => r.modifiedCount),
});
