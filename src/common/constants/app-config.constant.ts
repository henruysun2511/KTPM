export const AppConfig = {
  VALIDATION: {
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 20,
    PASSWORD_MAX_LENGTH: 20,
    PASSWORD_MIN_LENGTH: 5
  },
  JWT: {
    JWT_ACCESS_TOKEN_EXPIRE: '100m',
    JWT_REFRESH_TOKEN_EXPIRE: '6d',
    JWT_ACCESS_TOKEN_SECRET: 'TUTUTU',
    JWT_REFRESH_TOKEN_SECRET: 'QUANGTU'
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    SALT_ROUNDS: 10
  },
  PAYMENT: {
    CANCEL_URL: 'https://novawave-backend.onrender.com/api/v1/payments/cancel',
    RETURN_URL: 'https://novawave.vercel.app'
  },
  LOGGER: {
    LOGTAIL_LEVEL: 'error',
    CONSOLE_LEVEL: 'debug'
  },
  ROLE: {
    USER: '69207cb4d9a754278f81dd05'
  },
  PAGINATION: {
    SIZE_DEFAUT: 10,
    SIZE_NOTIFICATION: 5
  },
  DOMAIN: {
    FE: 'https://novawave.vercel.app',
    BE: 'https://novawave-backend.onrender.com'
  }
};
