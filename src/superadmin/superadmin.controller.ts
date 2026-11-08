import { Controller, Get, Put, Param, Body, Query, Headers } from '@nestjs/common';
import { SuperadminOrchestrationService } from './superadmin-orchestration.service.js';
import { SessionService } from '../auth/session.service.js';

@Controller('bff/superadmin')
export class SuperadminController {
  constructor(
    private readonly superadminService: SuperadminOrchestrationService,
    private readonly sessionService: SessionService,
  ) {}

  // T020: Dashboard overview
  @Get('dashboard')
  async getDashboard() {
    return this.superadminService.getDashboard();
  }

  // T021, T022: Role change
  @Put('users/:id/role')
  async changeRole(
    @Param('id') userId: string,
    @Headers() headers: Record<string, any>,
    @Body() body: { newRole: string; reason?: string },
  ) {
    const { userId: actorId, role } = this.sessionService.extractSession(headers);
    return this.superadminService.changeRole(userId, body.newRole, actorId, role, body.reason);
  }

  // T044: Deactivate user
  @Put('users/:id/deactivate')
  async deactivateUser(@Param('id') userId: string, @Headers() headers: Record<string, any>) {
    const { userId: actorId, role } = this.sessionService.extractSession(headers);
    return this.superadminService.deactivateUser(userId, actorId, role);
  }

  // T051: Update available_classes
  @Put('users/:id/available-classes')
  async updateAvailableClasses(
    @Param('id') userId: string,
    @Body() body: { availableClasses: number },
  ) {
    return this.superadminService.updateAvailableClasses(userId, body.availableClasses);
  }

  // T048: Attendance count per student
  @Get('attendance/count')
  async getAttendedCount(@Query('studentId') studentId: string) {
    return this.superadminService.getAttendedCount(studentId);
  }
}
