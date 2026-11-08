import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ErrorMapperService } from '../shared/errors/error-mapper.service.js';

@Injectable()
export class ApiHttpService {
  private readonly logger = new Logger(ApiHttpService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly errorMapper: ErrorMapperService,
  ) {
    this.baseUrl = this.config.get<string>('API_SERVICE_URL', 'http://localhost:3003');
  }

  // T021, T022, T023: Role change (superadmin only)
  async changeRole(userId: string, newRole: string, actorId: string, actorRole: string, reason?: string): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.http.put(`${this.baseUrl}/roles/${userId}`, { newRole, actorRole, actorId, reason }),
      );
      return data;
    } catch (err) {
      this.errorMapper.throw(err);
    }
  }

  // T023: Audit trail
  async getAuditTrail(bookingId: string): Promise<any[]> {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.baseUrl}/bookings/${bookingId}/audit`),
      );
      return data;
    } catch (err) {
      this.errorMapper.throw(err);
    }
  }

  // T020: All users (superadmin)
  async getAllUsers(): Promise<any[]> {
    try {
      const { data } = await firstValueFrom(this.http.get(`${this.baseUrl}/profiles`));
      return data;
    } catch (err) {
      this.errorMapper.throw(err);
    }
  }
}
