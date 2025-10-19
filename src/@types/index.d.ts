export interface ApiError {
  reqId: string;
  message: string;
  statusCode: number;
  code?: string;
  details?: Record<string, string[]>;
}

export * from './auth/auth';
export * from './user/user';

