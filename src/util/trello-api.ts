import Bottleneck from 'bottleneck';
import request from 'superagent';
import pick from 'lodash.pick';

import { TrelloApi, Board } from './trello';

const limiter = new Bottleneck({
  maxConcurrent: +process.env.LIMIT_MAX_CONCURRENT,
  minTime: +process.env.LIMIT_MIN_TIME_MS,
});

export const me = (token: string) => () =>
  request.get('https://api.trello.com/1/members/me')
    .query({
      key: process.env.TRELLO_KEY,
      token,
    })
    .then(r => r.body);

export const boards = (token: string) => (): Promise<Board[]> =>
  request.get('https://api.trello.com/1/members/me/boards')
    .query({
      key: process.env.TRELLO_KEY,
      token,
    })
    .then(res => res.body)
    .then(boards => boards.map((board: any) =>
      pick(board, [
        'id',
        'name',
        'labelNames',
        'memberships',
      ])));

export default (token: string): TrelloApi => ({
  me: limiter.wrap(me(token)),
  boards: limiter.wrap(boards(token)),
});
