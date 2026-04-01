export interface IUserLocal {
  _id: string;
  email: string;
  username: string;
  roleId: string;
  typeLogin?: string;
  deleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
