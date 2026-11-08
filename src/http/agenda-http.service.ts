import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ErrorMapperService } from '../shared/errors/error-mapper.service.js';

@Injectable()
export class AgendaHttpService {
  private readonly logger = new Logger(AgendaHttpService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly errorMapper: ErrorMapperService,
  ) {
    this.baseUrl = this.config.get<string>('AGENDA_SERVICE_URL', 'http://localhost:3002');
  }

  // T012: Get available slots
  async getAvailableSlots(date: string, professorId: string): Promise<any[]> {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.baseUrl}/slots`, { params: { date, professorId } }),
      );
      return data;
    } catch (err) {
      this.errorMapper.throw(err);
    }
  }

  // T013, T036: Create booking
  async createBooking(payload: any): Promise<any> {
    try {
      const { data } = await firstValueFrom(this.http.post(`${this.baseUrl}/bookings`, payload));
      return data;
    } catch (err) {
      this.errorMapper.throw(err);
    }
  }

  // T015, T042: Get student booking history (cursor-based)
  async getStudentBookings(studentId: string, cursor?: string, limit = 20): Promise<any> {
    try {
      const params: any = { studentId, limit };
      if (cursor) params.cursor = cursor;
      const { data } = await firstValueFrom(
        this.http.get(`${this.baseUrl}/bookings/student/${studentId}`, { params }),
      );
      const bookings = Array.isArray(data?.bookings) ? data.bookings : (Array.isArray(data) ? data : []);
      const nextCursor = bookings.length === limit
        ? Buffer.from(bookings[bookings.length - 1]?.id ?? '').toString('base64')
        : null;
      return { bookings, nextCursor, count: bookings.length };
    } catch (err) {
      this.errorMapper.throw(err);
    }
  }

  // T016, T017: Admin pending + approve/reject
  async getPendingBookings(professorId: string): Promise<any[]> {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.baseUrl}/bookings/pending`, { params: { professorId } }),
      );
      return data;
    } catch (err) {
      this.errorMapper.throw(err);
    }
  }

  async approveBooking(bookingId: string, actorId: string, actorRole: string): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.http.put(`${this.baseUrl}/bookings/${bookingId}/approve`, { actorId, actorRole }),
      );
      return data;
    } catch (err) {
      this.errorMapper.throw(err);
    }
  }

  async rejectBooking(bookingId: string, actorId: string, actorRole: string, reason?: string): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.http.put(`${this.baseUrl}/bookings/${bookingId}/reject`, { actorId, actorRole, reason }),
      );
      return data;
    } catch (err) {
      this.errorMapper.throw(err);
    }
  }

  async cancelBooking(bookingId: string, actorId: string, actorRole: string): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.http.put(`${this.baseUrl}/bookings/${bookingId}/cancel`, { actorId, actorRole }),
      );
      return data;
    } catch (err) {
      this.errorMapper.throw(err);
    }
  }

  // T046: Attendance
  async updateAttendance(bookingId: string, payload: any): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.http.put(`${this.baseUrl}/attendance/${bookingId}`, payload),
      );
      return data;
    } catch (err) {
      this.errorMapper.throw(err);
    }
  }

  async getAttendanceCount(studentId: string): Promise<number> {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.baseUrl}/attendance/count`, { params: { studentId } }),
      );
      return data?.count ?? 0;
    } catch (err) {
      this.errorMapper.throw(err);
    }
  }

  // T020: All bookings for superadmin
  async getAllBookings(): Promise<any[]> {
    try {
      const { data } = await firstValueFrom(this.http.get(`${this.baseUrl}/bookings`));
      return data;
    } catch (err) {
      this.errorMapper.throw(err);
    }
  }
}
