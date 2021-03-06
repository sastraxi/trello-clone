import { get } from '../throttled-request';

export default (token: string) => () =>
  get('/1/members/me', {
    key: process.env.TRELLO_KEY,
    token,
  }).then(r => r.body);
