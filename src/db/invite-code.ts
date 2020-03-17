import { Db, ObjectId } from 'mongodb';
import crypto from 'crypto';

const COLLECTION = 'invite_code';

export interface InviteCode {
  id: string;
  code: string;
}

const generateCode = (length: number): string => 
  crypto.randomBytes(Math.ceil(length / 2)).toString('hex');

const toDb = ({ id, ...restCode }: InviteCode): object => ({
  _id: new ObjectId(id),
  ...restCode,
});

const fromDb = ({ _id, ...restCode }: any): InviteCode => ({
  id: _id,
  ...restCode,
});

export default (db: Db) => ({
  setup: async (): Promise<any> =>
    db.collection(COLLECTION).createIndex({ code: 1 }, { unique: true }),

  all: (): Promise<InviteCode[]> =>
    db.collection(COLLECTION)
      .find()
      .toArray()
      .then(docs => docs.map(fromDb)),

  find: (id: string): Promise<InviteCode> =>
    db.collection(COLLECTION)
      .findOne({ _id: new ObjectId(id) })
      .then(fromDb),

  count: (): Promise<number> =>
    db.collection(COLLECTION)
      .countDocuments(),

  generate: async (length = 12): Promise<InviteCode> => {
    const code = generateCode(length);
    const r = await db.collection(COLLECTION).insertOne({ code });
    return {
      id: r.insertedId,
      code,
    };
  },

  isValid: async (code: string): Promise<boolean> =>
    db.collection(COLLECTION)
      .countDocuments({ code })
      .then(x => x === 1),

  delete: async (id: string): Promise<boolean> => {
    const { deletedCount } = await db.collection(COLLECTION)
      .deleteOne({
        _id: new ObjectId(id),
      });
    return deletedCount === 1;
  },
});
