import { Injectable } from '@nestjs/common';
import { AgendaHttpService } from '../http/agenda-http.service.js';

@Injectable()
export class AttendanceOrchestrationService {
  constructor(private readonly agendaHttp: AgendaHttpService) {}

  async updateAttendance(bookingId: string, payload: any): Promise<any> {
    return this.agendaHttp.updateAttendance(bookingId, payload);
  }

  async getAttendanceCount(studentId: string): Promise<any> {
    const count = await this.agendaHttp.getAttendanceCount(studentId);
    return { studentId, count };
  }
}
