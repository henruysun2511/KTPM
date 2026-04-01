import { HttpMethod } from 'common/enum';

export const defaultRoutes = [
  { path: 'api/v1/auth/register', method: HttpMethod.POST },
  { path: 'api/v1/auth/login', method: HttpMethod.POST },
  // { path: '/auth/profile', method: HttpMethod.GET },
  // { path: '/auth/activate-account', method: HttpMethod.GET },
  { path: 'api/v1/auth/forgot-password', method: HttpMethod.POST },
  { path: 'api/v1/auth/reset-password', method: HttpMethod.PATCH },
  { path: 'api/v1/auth/verify-otp', method: HttpMethod.POST },
  { path: 'api/v1/auth/google', method: HttpMethod.GET },
  { path: 'api/v1/auth/google-redirect', method: HttpMethod.GET },
  // { path: 'api/v1/auth/change-password', method: HttpMethod.PUT },
  // { path: '/auth/profile', method: HttpMethod.PUT },
  // { path: '/revoke/:id', method: HttpMethod.PUT },
  // { path: '/auth/token-info', method: HttpMethod.GET },
  // { path: '/dashboard/users', method: HttpMethod.GET },
  // { path: '/dashboard/os', method: HttpMethod.GET },
  // { path: '/dashboard/browser', method: HttpMethod.GET },
  { path: 'api/v1/auth/logout', method: HttpMethod.POST }
];
