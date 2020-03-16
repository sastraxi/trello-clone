import { Request, Response } from "express-serve-static-core";
import moment from 'moment';

import getMongoClient from '../util/mongo-client';
import MonitorModel from '../db/monitor';

const WEBHOOK_IPS = [
  '107.23.104.115',
  '107.23.149.70',
  '54.152.166.250',
  '54.164.77.56',
  '54.209.149.230',
];

export default async (req: Request, res: Response): Promise<Response> => {
  const { boardId } = req.params;
  
  console.log(`Webhook for board:${boardId}!`);

  if (!WEBHOOK_IPS.indexOf(req.ip)) {
    return res.send(400).send(`${req.ip} not in webhook IP whitelist!`);
  }

  const client = await getMongoClient();
  try {
    const Monitor = MonitorModel(client.db());
    const monitor = await Monitor.findByBoard(boardId);
    await Monitor.schedule(
      monitor.id,
      moment().add(monitor.delaySeconds, 'second'),
    );
  } finally {
    client.close();
  }

  return res.status(200).send('ok');
};
