// T039: Standard error codes (frontend translates to user language)
export const BffErrorCodes = {
  NO_CLASSES_AVAILABLE: 'ERR_NO_CLASSES_AVAILABLE',
  BOOKING_CONFLICT: 'ERR_BOOKING_CONFLICT',
  CANCELLATION_WINDOW: 'ERR_CANCELLATION_WINDOW',
  INVALID_ROLE: 'ERR_INVALID_ROLE',
  UNAUTHORIZED: 'ERR_UNAUTHORIZED',
  NOT_FOUND: 'ERR_NOT_FOUND',
  DOWNSTREAM_UNAVAILABLE: 'ERR_DOWNSTREAM_UNAVAILABLE',
  DUPLICATE_USER: 'ERR_DUPLICATE_USER',
} as const;

export type BffErrorCode = typeof BffErrorCodes[keyof typeof BffErrorCodes];

export interface BffErrorPayload {
  code: BffErrorCode;
  message: string;
  traceId?: string;
  details?: Record<string, unknown>;
}
