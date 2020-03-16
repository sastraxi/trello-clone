import { Request, Response } from "express-serve-static-core";
import { Board } from "../../trello/definitions";

import getMongoClient from '../../util/mongo-client';
import SyncModel from '../../db/sync';

export default async (req: Request, res: Response): Promise<Response | void> => {
  const {
    sourceId,
    targetId,
    label,
  } = req.body;
  
  if (sourceId === targetId) {
    return res.status(400).send('Source and target must be distinct!');
  }

  // FIXME: shouldn't have to keep re-fetching
  const boards = await req.trello.boards();
  const source = boards.find((board: Board) => board.id === sourceId);
  const target = boards.find((board: Board) => board.id === targetId);

  const client = await getMongoClient();
  try {
    const Sync = SyncModel(client.db());
    await Sync.create(source, target, [label]);
  } finally {
    client.close();
  }

  return res.redirect('/');
};
