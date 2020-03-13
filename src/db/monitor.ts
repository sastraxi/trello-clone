import { Db } from 'mongodb';

const COLLECTION = 'monitor';

export interface Monitor {
  id: string;
  webhookId: string;
  boardId: string;
  enabled: boolean;
}

export default (db: Db) => ({
  find: (webhookId: string): Promise<Monitor> =>
    db.collection(COLLECTION)
      .findOne({ webhookId })
      .then(({ _id, ...doc }) => ({
        id: _id,
        ...doc,
      })),

  all: (): Promise<Monitor[]> =>
    db.collection(COLLECTION)
      .find()
      .toArray()
      .then(docs => docs
        .map(({ _id, ...doc }) => ({
          id: _id,
          ...doc,
        }))),

  create: async (webhookId: string, boardId: string, enabled: boolean): Promise<Monitor> => {
    const r = await db.collection(COLLECTION)
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
    const { deletedCount } = await db.collection(COLLECTION).deleteOne({ webhookId });
    return deletedCount === 1;
  },
});
