import { Db } from 'mongodb';

const COLLECTION = 'user';

export interface User {
  id: string;
  email: string;
  token: string;
  tokenSecret: string;

}

const toDb = ({ id, ...restUser }: User): object => ({
  _id: id,
  ...restUser,
});

const fromDb = ({ _id, ...restUser }: any): User => ({
  id: _id,
  ...restUser,
});

export default (db: Db) => ({
  find: (id: string): Promise<User> =>
    db.collection(COLLECTION)
      .findOne({ _id: id })
      .then(fromDb),

  count: (): Promise<number> =>
    db.collection(COLLECTION)
      .count(),

  create: async (user: User): Promise<User> => {
    // TODO: is there a better place for these createindex calls?
    await db.collection(COLLECTION).createIndex({ email: 1 }, { unique: true });
    await db.collection(COLLECTION).createIndex({ scheduledAt: 1 });
    await db.collection(COLLECTION).insertOne(toDb);
    return user;
  },

  delete: async (webhookId: string): Promise<boolean> => {
    const { deletedCount } = await db.collection(COLLECTION).deleteOne({ webhookId });
    return deletedCount === 1;
  },
});
