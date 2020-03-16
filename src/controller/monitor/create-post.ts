import { Request, Response } from "express-serve-static-core";
import { Board } from "../../trello/definitions";

import getMongoClient from '../../util/mongo-client';
import MonitorModel from '../../db/monitor';

export default async (req: Request, res: Response): Promise<void> => {
  const { boardId, delaySeconds } = req.body;
  let monitor;
  let Monitor;
    
  // FIXME: shouldn't have to keep re-fetching; at least just get the one
  const boards = await req.trello.boards();
  const board = boards.find((board: Board) => board.id === boardId);
  const client = await getMongoClient();
  try {
    Monitor = MonitorModel(client.db());
  
    const webhookId = await req.trello.createWebhook(board.id,
      `trello-sync monitor webhook for ${board.name} created by ${req.user.username}`);  

    monitor = await Monitor.create(req.user.id, webhookId, board, +delaySeconds);
  } catch (err) {
    if (monitor?.id) await Monitor.delete(monitor.id);
    console.error('Could not create monitor', err);

  } finally {
    client.close();
  }

  return res.redirect('/');
};
