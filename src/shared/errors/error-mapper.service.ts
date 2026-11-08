import { Injectable, HttpException } from '@nestjs/common';
import { BffErrorCodes, BffErrorPayload, BffErrorCode } from './bff-error-codes.js';

@Injectable()
export class ErrorMapperService {
  // T039: Map downstream errors to standard BFF codes
  map(error: any): { status: number; payload: BffErrorPayload } {
    const downstreamCode = error?.response?.data?.code ?? error?.code ?? '';
    const message = error?.response?.data?.message ?? error?.message ?? 'Error desconocido';

    const mapping: Record<string, { status: number; code: string }> = {
      ERR_NO_CLASSES_AVAILABLE: { status: 422, code: BffErrorCodes.NO_CLASSES_AVAILABLE },
      ERR_BOOKING_CONFLICT:     { status: 409, code: BffErrorCodes.BOOKING_CONFLICT },
      ERR_CANCELLATION_WINDOW:  { status: 422, code: BffErrorCodes.CANCELLATION_WINDOW },
      ERR_UNAUTHORIZED:         { status: 403, code: BffErrorCodes.UNAUTHORIZED },
      ERR_INVALID_ROLE:         { status: 403, code: BffErrorCodes.INVALID_ROLE },
      ERR_DUPLICATE_USER:       { status: 409, code: BffErrorCodes.DUPLICATE_USER },
      ERR_NOT_FOUND:            { status: 404, code: BffErrorCodes.NOT_FOUND },
    };

    const mapped = mapping[downstreamCode];
    if (mapped) {
      return { status: mapped.status, payload: { code: mapped.code as BffErrorCode, message } };
    }

    if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND') {
      return { status: 503, payload: { code: BffErrorCodes.DOWNSTREAM_UNAVAILABLE, message: 'Servicio no disponible temporalmente' } };
    }

    return { status: error?.response?.status ?? 500, payload: { code: BffErrorCodes.DOWNSTREAM_UNAVAILABLE, message } };
  }

  throw(error: any): never {
    const { status, payload } = this.map(error);
    throw new HttpException(payload, status);
  }
}
