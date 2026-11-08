import { Injectable } from '@nestjs/common';
import { AlumnosHttpService } from '../http/alumnos-http.service.js';
import { AgendaHttpService } from '../http/agenda-http.service.js';

@Injectable()
export class ProfilesOrchestrationService {
  constructor(
    private readonly alumnosHttp: AlumnosHttpService,
    private readonly agendaHttp: AgendaHttpService,
  ) {}

  // T009: Get profile with booking counter (T032)
  async getProfile(userId: string): Promise<any> {
    const [profile, bookings] = await Promise.all([
      this.alumnosHttp.getProfile(userId),
      this.agendaHttp.getStudentBookings(userId),
    ]);
    return {
      ...profile,
      bookingCount: bookings?.count ?? 0,
      bookings: bookings?.bookings ?? [],
    };
  }
}
