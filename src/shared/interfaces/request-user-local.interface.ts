import { Request } from 'express';

import { IUserRequest } from './user.interface';

export interface RequestWithUserLocal extends Request {
  user: IUserRequest;
}
