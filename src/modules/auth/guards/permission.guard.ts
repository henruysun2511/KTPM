/* eslint-disable no-empty */
import { CanActivate, ExecutionContext, Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { defaultRoutes } from 'common/constants/default-routes.constant';
import { HttpMethod } from 'common/enum';
import { RoleName } from 'common/enum/role-name.enum';
import redisClient from 'configs/redis.config';
import { CustomLogger } from 'loggers/nestToWinstonLogger.service';
import { PermissionService } from 'modules/permission/services/permission.service';
import { RedisService } from 'modules/redis/services/redis.service';
import { RoleService } from 'modules/role/services/role.service';
import { IUserRequest } from 'shared/interfaces';

// adjust this import to the actual file that exports your configured redisClient

type PermissionKey = string; // e.g. "get:/api/products/:id"

interface IRoutePayload {
  path: string;
  method: HttpMethod;
}

@Injectable()
export class PermissionGuard implements CanActivate, OnModuleInit, OnModuleDestroy {
  private localCache = new Map<string, { keys: string[]; expiresAt: number }>();
  private readonly LOCAL_TTL_MS = 30_000;

  private readonly REDIS_TTL_SEC = 300;
  private readonly INVALIDATE_CHANNEL = 'role:perms:invalidate';

  private redis = redisClient;
  private redisSub = redisClient.duplicate();

  constructor(
    private readonly roleService: RoleService,
    private readonly permissionService: PermissionService,
    private readonly redisService: RedisService,
    private readonly logger: CustomLogger
  ) {}

  // Nếu có thông báo invalidate (role bị thay đổi), xóa cache local + cache Redis
  async onModuleInit() {
    await this.redisSub.subscribe(this.INVALIDATE_CHANNEL);
    this.redisSub.on('message', (_channel, message) => {
      if (!message) return;
      this.localCache.delete(message); // xóa local cache role đó
      const key = this.getRedisKeyForRole(message);
      this.redis.del(key).catch(() => {}); // xóa Redis cache role đó
    });
  }

  // Khi module bị destroy → unsubscribe khỏi Redis pub/sub.
  async onModuleDestroy() {
    try {
      await this.redisSub.quit();
    } catch {}
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const path: string = request.route?.path ?? request.path ?? '/';
    const method: HttpMethod = (request.method ?? '').toLowerCase();

    const userReq = request.user as IUserRequest | undefined;
    if (!userReq?.userId) return false;

    const permitted = this.checkIfDefaultRoute({ path, method });
    if (permitted) {
      return true;
    }
    const roleName = await this.roleService.findNameById(userReq.roleId);
    if (roleName === RoleName.SUPPER_ADMIN) return true;
    const permSet = await this.getPermissionSetForRole(String(userReq.roleId));
    const key = this.makeKey(method, this.normalizePath(path));

    return permSet.has(key);
  }

  // Tạo key chuẩn
  private makeKey(method: string, path: string): PermissionKey {
    return `${method}:${path}`;
  }

  // chuẩn hóa path vd: api/users/=> api/users
  private normalizePath(path: string): string {
    if (!path) return path;
    let p = path.trim();
    if (p !== '/' && p.endsWith('/')) p = p.slice(0, -1);
    return p.toLowerCase();
  }

  // redis key
  private getRedisKeyForRole(roleId: string) {
    return `role:perms:${roleId}`;
  }

  // Lấy permission và set cho role
  private async getPermissionSetForRole(roleId: string): Promise<Set<PermissionKey>> {
    const now = Date.now();
    const cached = this.localCache.get(roleId);
    // Nếu có localCache trả luôn kết quả
    if (cached && cached.expiresAt > now) return new Set(cached.keys);

    // Nếu ko có localCache kiểm tra redis
    const redisKey = this.getRedisKeyForRole(roleId);

    try {
      const raw = await this.redisService.getValue(redisKey);
      if (raw) {
        const arr: string[] = JSON.parse(raw);
        this.localCache.set(roleId, { keys: arr, expiresAt: now + this.LOCAL_TTL_MS });
        return new Set(arr);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      this.logger.error(err?.message);
    }

    // Nếu redis vẫn ko có thì truy vấn từ db và set lại cho localCache và redis
    const permIds = await this.roleService.getPermissions(roleId);
    if (!permIds || permIds.length === 0) {
      this.localCache.set(roleId, { keys: [], expiresAt: now + this.LOCAL_TTL_MS });
      await this.redisService.setValue(redisKey, JSON.stringify([]), this.REDIS_TTL_SEC);
      return new Set();
    }

    const perms = await this.permissionService.getPermissionsByIds(permIds);

    const keys = perms.map((p) =>
      this.makeKey((p.method ?? '').toString().toLowerCase(), this.normalizePath(p.path ?? ''))
    );

    try {
      await this.redisService.setValue(redisKey, JSON.stringify(keys), this.REDIS_TTL_SEC);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      this.logger.error(err?.message);
    }
    this.localCache.set(roleId, { keys, expiresAt: now + this.LOCAL_TTL_MS });

    return new Set(keys);
  }

  //
  async publishInvalidate(roleId: string) {
    try {
      await this.redis.publish(this.INVALIDATE_CHANNEL, roleId);
    } catch {}
  }

  checkIfDefaultRoute(permissionAgainst: IRoutePayload) {
    const { path, method } = permissionAgainst;
    return defaultRoutes.some((route) => {
      const rPath = this.normalizePath(route.path ?? '');
      const rMethod = String(route.method ?? '').toLowerCase();
      return rPath === path && rMethod === String(method).toLowerCase();
    });
  }
}
