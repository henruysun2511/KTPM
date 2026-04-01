import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { env } from 'configs';
import { CustomLogger } from 'loggers/nestToWinstonLogger.service';

import { Notification } from '../schemas/notification.schema';

// ...existing code...

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private onlineUsers = new Map<string, Set<string>>(); // userId -> socketIds
  private socketToUser = new Map<string, string>(); // socketId -> userId

  constructor(
    private readonly jwtService: JwtService,
    private readonly logger: CustomLogger
  ) {}

  handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;

    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify(token, { secret: env.JWT_ACCESS_TOKEN_SECRET });
      const userId = payload.sub;

      client.data.userId = userId;
      void client.join(`user_${userId}`);

      // track socket <-> user mappings
      this.socketToUser.set(client.id, userId);
      const sockets = this.onlineUsers.get(userId) || new Set<string>();
      sockets.add(client.id);
      this.onlineUsers.set(userId, sockets);

      // optional: log connection
      this.logger.log(`Socket connected: ${client.id} -> user ${userId}`, NotificationGateway.name);
    } catch {
      this.logger.warn('Socket auth failed', NotificationGateway.name);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketToUser.get(client.id);
    if (!userId) return;

    this.socketToUser.delete(client.id);

    const sockets = this.onlineUsers.get(userId);
    if (!sockets) return;

    sockets.delete(client.id);
    if (sockets.size === 0) {
      this.onlineUsers.delete(userId);
    }
  }

  // ✅ GỬI CHO TẤT CẢ SOCKET CỦA USER
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendNotificationToUser(userId: string, payload: any) {
    const sockets = this.onlineUsers.get(userId);

    if (!sockets || sockets.size === 0) {
      // fallback: emit to room if user joined it
      try {
        this.server.to(`user_${userId}`).emit('notification', payload);
      } catch (err: any) {
        this.logger.error('Socket emit failed (room)', err, NotificationGateway.name, { userId });
      }
      return;
    }

    for (const socketId of sockets) {
      try {
        this.server.to(socketId).emit('notification', payload);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        this.logger.error('Socket emit failed', err, NotificationGateway.name, {
          userId,
          socketId
        });
      }
    }
  }

  sendNotificationToUsers(notifications: Notification[]) {
    if (!Array.isArray(notifications) || notifications.length === 0) return;

    const grouped = notifications.reduce(
      (map, n) => {
        const id = String(n.receiverId ?? '');
        if (!id) return map;
        if (!map[id]) map[id] = [];
        map[id].push(n);
        return map;
      },
      {} as Record<string, Notification[]>
    );

    for (const [userId, payloads] of Object.entries(grouped)) {
      const sockets = this.onlineUsers.get(userId);
      if (!sockets || sockets.size === 0) {
        try {
          this.server.to(`user_${userId}`).emit('notifications', payloads);
        } catch (err: any) {
          this.logger.error('Socket bulk emit failed (room)', err, NotificationGateway.name, { userId });
        }
        continue;
      }

      for (const socketId of sockets) {
        try {
          this.server.to(socketId).emit('notifications', payloads);
        } catch (err: any) {
          this.logger.error('Socket bulk emit failed', err, NotificationGateway.name, { userId, socketId });
        }
      }
    }
  }
}
