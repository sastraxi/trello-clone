import pick from 'lodash.pick';

import { Board } from '../definitions';
import { get } from '../throttled-request';

export default (token: string) => (): Promise<Board[]> =>
  get('/1/members/me/boards', {
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
        'url',
      ])));
