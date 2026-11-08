import { Controller, Get, Param } from '@nestjs/common';
import { AuditOrchestrationService } from './audit-orchestration.service.js';

@Controller('bff/audit')
export class AuditController {
  constructor(private readonly auditService: AuditOrchestrationService) {}

  @Get('bookings/:id')
  async getAuditTrail(@Param('id') bookingId: string) {
    return this.auditService.getAuditTrail(bookingId);
  }
}
