import { Controller, Put, Get, Param, Body, Query, Headers } from '@nestjs/common';
import { AttendanceOrchestrationService } from './attendance-orchestration.service.js';
import { SessionService } from '../auth/session.service.js';

@Controller('bff/attendance')
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceOrchestrationService,
    private readonly sessionService: SessionService,
  ) {}

  @Put(':bookingId')
  async updateAttendance(
    @Param('bookingId') bookingId: string,
    @Headers() headers: Record<string, any>,
    @Body() body: { studentId: string; status: string },
  ) {
    const { userId, role } = this.sessionService.extractSession(headers);
    return this.attendanceService.updateAttendance(bookingId, { ...body, actorId: userId, actorRole: role });
  }

  @Get('count')
  async getCount(@Query('studentId') studentId: string) {
    return this.attendanceService.getAttendanceCount(studentId);
  }
}
