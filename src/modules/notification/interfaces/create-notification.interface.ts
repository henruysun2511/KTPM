import { NotificationType } from 'common/enum';

export interface ICreateNotificationPayload {
  receiverId: string;
  title: string;
  message: string;
  referenceId?: string;
  type: NotificationType;
}
