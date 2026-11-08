import { Controller, Get, Query } from '@nestjs/common';
import { SlotsOrchestrationService } from './slots-orchestration.service.js';

@Controller('bff/slots')
export class SlotsController {
  constructor(private readonly slotsService: SlotsOrchestrationService) {}

  // T012: Slot availability query
  @Get()
  async getSlots(
    @Query('date') date: string,
    @Query('professorId') professorId: string,
  ) {
    return this.slotsService.getAvailableSlots(date, professorId);
  }
}
