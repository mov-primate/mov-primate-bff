import { Injectable } from '@nestjs/common';
import { AlumnosHttpService } from '../http/alumnos-http.service.js';
import { AgendaHttpService } from '../http/agenda-http.service.js';
import { ApiHttpService } from '../http/api-http.service.js';

@Injectable()
export class SuperadminOrchestrationService {
  constructor(
    private readonly alumnosHttp: AlumnosHttpService,
    private readonly agendaHttp: AgendaHttpService,
    private readonly apiHttp: ApiHttpService,
  ) {}

  // T020, T044: Superadmin overview - users + bookings + attendance
  async getDashboard(): Promise<any> {
    const [users, bookings] = await Promise.all([
      this.alumnosHttp.getAllUsers(),
      this.agendaHttp.getAllBookings(),
    ]);
    return { users, bookings, userCount: users?.length ?? 0, bookingCount: bookings?.length ?? 0 };
  }

  // T021, T022, T023: Role change (superadmin only)
  async changeRole(userId: string, newRole: string, actorId: string, actorRole: string, reason?: string): Promise<any> {
    return this.apiHttp.changeRole(userId, newRole, actorId, actorRole, reason);
  }

  // T044: Deactivate user
  async deactivateUser(userId: string, actorId: string, actorRole: string): Promise<any> {
    return this.alumnosHttp.deactivateUser(userId, actorId, actorRole);
  }

  // T051: Update available_classes
  async updateAvailableClasses(userId: string, availableClasses: number): Promise<any> {
    return this.alumnosHttp.updateAvailableClasses(userId, availableClasses);
  }

  // T048: Aggregate attendance count per student
  async getAttendedCount(studentId: string): Promise<any> {
    const count = await this.agendaHttp.getAttendanceCount(studentId);
    return { studentId, attendedCount: count };
  }
}
