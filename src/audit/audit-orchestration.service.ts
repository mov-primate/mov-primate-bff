import { Injectable } from '@nestjs/common';
import { ApiHttpService } from '../http/api-http.service.js';

@Injectable()
export class AuditOrchestrationService {
  constructor(private readonly apiHttp: ApiHttpService) {}

  // T023, T041: Get audit trail for booking
  async getAuditTrail(bookingId: string): Promise<any[]> {
    return this.apiHttp.getAuditTrail(bookingId);
  }
}
