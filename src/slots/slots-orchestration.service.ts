import { Injectable } from '@nestjs/common';
import { AgendaHttpService } from '../http/agenda-http.service.js';

@Injectable()
export class SlotsOrchestrationService {
  constructor(private readonly agendaHttp: AgendaHttpService) {}

  // T012: Get available slots
  async getAvailableSlots(date: string, professorId: string): Promise<any[]> {
    return this.agendaHttp.getAvailableSlots(date, professorId);
  }
}
