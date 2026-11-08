import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { AgendaHttpService } from '../http/agenda-http.service.js';
import { AlumnosHttpService } from '../http/alumnos-http.service.js';
import { NotificationOrchestrationService } from '../notifications/notification-orchestration.service.js';
import { BffErrorCodes } from '../shared/errors/bff-error-codes.js';

@Injectable()
export class BookingOrchestrationService {
  constructor(
    private readonly agendaHttp: AgendaHttpService,
    private readonly alumnosHttp: AlumnosHttpService,
    private readonly notificationService: NotificationOrchestrationService,
  ) {}

  // T013, T050, FR-011: Create booking with available_classes pre-check
  async createBooking(studentId: string, professorId: string, slotStart: string, slotEnd: string, actorRole: string): Promise<any> {
    const availableClasses = await this.alumnosHttp.getAvailableClasses(studentId);
    if (availableClasses <= 0) {
      throw new HttpException(
        { code: BffErrorCodes.NO_CLASSES_AVAILABLE, message: 'El alumno no tiene clases disponibles' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const booking = await this.agendaHttp.createBooking({
      studentId, professorId, slotStart, slotEnd,
      studentRole: actorRole, availableClasses,
    });

    // T049: Trigger notification on booking created
    this.notificationService.emitBookingStatusChange(booking?.id ?? booking?._id, 'pendiente');

    return booking;
  }

  // T047: Cancellation window enforced downstream; propagate error
  async cancelBooking(bookingId: string, actorId: string, actorRole: string): Promise<any> {
    const result = await this.agendaHttp.cancelBooking(bookingId, actorId, actorRole);
    this.notificationService.emitBookingStatusChange(bookingId, 'cancelado');
    return result;
  }

  // T015, T042: Booking history with cursor pagination
  async getStudentBookings(studentId: string, cursor?: string, limit = 20): Promise<any> {
    return this.agendaHttp.getStudentBookings(studentId, cursor, limit);
  }
}
