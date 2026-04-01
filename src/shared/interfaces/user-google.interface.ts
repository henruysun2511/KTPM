import { User } from 'modules/user/schemas/user.schema';

export interface IUserGoogle {
  user: User;
  accessToken: string;
  refreshToken: string;
}
