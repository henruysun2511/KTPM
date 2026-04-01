import { Request } from 'express';

import { IUserGoogle } from './user-google.interface';

export interface RequestWithUserGoogle extends Request {
  user: IUserGoogle;
}
