import { Db } from 'mongodb';

const WATCH_COLLECTION = 'watch';

export interface Watch {
  id: string;
  webhookId: string;
  boardId: string;
  enabled: boolean;
}

export default (db: Db) => ({
  find: (webhookId: string): Promise<Watch> =>
    db.collection(WATCH_COLLECTION)
      .findOne({ webhookId })
      .then(({ _id, ...doc }) => ({
        id: _id,
        ...doc,
      })),

  all: (): Promise<Watch[]> =>
    db.collection(WATCH_COLLECTION)
      .find()
      .toArray()
      .then(docs => docs
        .map(({ _id, ...doc }) => ({
          id: _id,
          ...doc,
        }))),

  create: async (webhookId: string, boardId: string, enabled: boolean): Promise<Watch> => {
    const r = await db.collection(WATCH_COLLECTION)
      .insertOne({
        webhookId,
        boardId,
        enabled,
      });
    return {
      id: r.insertedId,
      webhookId,
      boardId,
      enabled,
    };
  },

  delete: async (webhookId: string): Promise<boolean> => {
    const { deletedCount } = await db.collection(WATCH_COLLECTION).deleteOne({ webhookId });
    return deletedCount === 1;
  },
});
