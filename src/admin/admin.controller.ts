import { Controller, Get, Put, Param, Body, Headers } from '@nestjs/common';
import { AdminOrchestrationService } from './admin-orchestration.service.js';
import { SessionService } from '../auth/session.service.js';

@Controller('bff/admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminOrchestrationService,
    private readonly sessionService: SessionService,
  ) {}

  // T016: Pending bookings for admin
  @Get('bookings/pending')
  async getPending(@Headers() headers: Record<string, any>) {
    const { userId } = this.sessionService.extractSession(headers);
    return this.adminService.getPendingBookings(userId);
  }

  // T017: Approve
  @Put('bookings/:id/approve')
  async approve(@Param('id') id: string, @Headers() headers: Record<string, any>) {
    const { userId, role } = this.sessionService.extractSession(headers);
    return this.adminService.approveBooking(id, userId, role);
  }

  // T017: Reject
  @Put('bookings/:id/reject')
  async reject(
    @Param('id') id: string,
    @Headers() headers: Record<string, any>,
    @Body() body: { reason?: string },
  ) {
    const { userId, role } = this.sessionService.extractSession(headers);
    return this.adminService.rejectBooking(id, userId, role, body.reason);
  }

  // T046: Attendance
  @Put('bookings/:id/attendance')
  async updateAttendance(
    @Param('id') id: string,
    @Headers() headers: Record<string, any>,
    @Body() body: { studentId: string; status: string },
  ) {
    const { userId, role } = this.sessionService.extractSession(headers);
    return this.adminService.updateAttendance(id, body.studentId, body.status, userId, role);
  }
}
