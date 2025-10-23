export interface ApiError {
  reqId: string;
  message: string;
  statusCode: number;
  code?: string;
  details?: Record<string, string[]>;
}

export * from './auth';
export * from './medication';
export * from './user';

