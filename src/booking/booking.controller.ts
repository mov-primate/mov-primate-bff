import { Controller, Post, Put, Get, Param, Body, Query, Headers } from '@nestjs/common';
import { BookingOrchestrationService } from './booking-orchestration.service.js';
import { SessionService } from '../auth/session.service.js';

@Controller('bff/bookings')
export class BookingController {
  constructor(
    private readonly bookingService: BookingOrchestrationService,
    private readonly sessionService: SessionService,
  ) {}

  // T013, FR-011: Create booking (alumno)
  @Post()
  async createBooking(
    @Headers() headers: Record<string, any>,
    @Body() body: { professorId: string; slotStart: string; slotEnd: string },
  ) {
    const { userId, role } = this.sessionService.extractSession(headers);
    return this.bookingService.createBooking(userId, body.professorId, body.slotStart, body.slotEnd, role);
  }

  // T015, T042: Booking history (cursor-based pagination)
  @Get('history')
  async getHistory(
    @Headers() headers: Record<string, any>,
    @Query('cursor') cursor?: string,
    @Query('limit') limit = '20',
  ) {
    const { userId } = this.sessionService.extractSession(headers);
    return this.bookingService.getStudentBookings(userId, cursor, parseInt(limit, 10));
  }

  // T047: Cancel booking (1hr window enforced downstream)
  @Put(':id/cancel')
  async cancelBooking(
    @Param('id') id: string,
    @Headers() headers: Record<string, any>,
  ) {
    const { userId, role } = this.sessionService.extractSession(headers);
    return this.bookingService.cancelBooking(id, userId, role);
  }
}
