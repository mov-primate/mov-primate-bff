import { Injectable } from '@nestjs/common';
import { AgendaHttpService } from '../http/agenda-http.service.js';
import { NotificationOrchestrationService } from '../notifications/notification-orchestration.service.js';

@Injectable()
export class AdminOrchestrationService {
  constructor(
    private readonly agendaHttp: AgendaHttpService,
    private readonly notificationService: NotificationOrchestrationService,
  ) {}

  // T016: Get pending reservations for admin (scoped to their professorId)
  async getPendingBookings(professorId: string): Promise<any[]> {
    return this.agendaHttp.getPendingBookings(professorId);
  }

  // T017: Approve booking (admin scoped)
  async approveBooking(bookingId: string, actorId: string, actorRole: string): Promise<any> {
    const result = await this.agendaHttp.approveBooking(bookingId, actorId, actorRole);
    this.notificationService.emitBookingStatusChange(bookingId, 'confirmado');
    return result;
  }

  // T017: Reject booking (admin scoped)
  async rejectBooking(bookingId: string, actorId: string, actorRole: string, reason?: string): Promise<any> {
    const result = await this.agendaHttp.rejectBooking(bookingId, actorId, actorRole, reason);
    this.notificationService.emitBookingStatusChange(bookingId, 'rechazado');
    return result;
  }

  // T046: Register attendance (admin/superadmin)
  async updateAttendance(bookingId: string, studentId: string, status: string, actorId: string, actorRole: string): Promise<any> {
    return this.agendaHttp.updateAttendance(bookingId, { studentId, status, actorId, actorRole });
  }
}
