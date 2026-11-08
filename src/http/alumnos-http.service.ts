import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ErrorMapperService } from '../shared/errors/error-mapper.service.js';

@Injectable()
export class AlumnosHttpService {
  private readonly logger = new Logger(AlumnosHttpService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly errorMapper: ErrorMapperService,
  ) {
    this.baseUrl = this.config.get<string>('ALUMNOS_SERVICE_URL', 'http://localhost:3001');
  }

  // T007, T050: Get profile + available_classes
  async getProfile(userId: string): Promise<any> {
    try {
      const { data } = await firstValueFrom(this.http.get(`${this.baseUrl}/profiles/user/${userId}`));
      return data;
    } catch (err) {
      this.logger.error('Error getting profile', (err as any)?.message);
      this.errorMapper.throw(err);
    }
  }

  // T050, FR-011: Get available_classes for pre-check
  async getAvailableClasses(userId: string): Promise<number> {
    const profile = await this.getProfile(userId);
    return profile?.availableClasses ?? 0;
  }

  // T044, T051: Superadmin update available_classes
  async updateAvailableClasses(userId: string, availableClasses: number): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.http.put(`${this.baseUrl}/profiles/${userId}/available-classes`, { availableClasses }),
      );
      return data;
    } catch (err) {
      this.errorMapper.throw(err);
    }
  }

  // T044: Superadmin deactivate user
  async deactivateUser(userId: string, actorId: string, actorRole: string): Promise<any> {
    try {
      const { data } = await firstValueFrom(
        this.http.put(`${this.baseUrl}/users/${userId}/deactivate`, { actorId, actorRole }),
      );
      return data;
    } catch (err) {
      this.errorMapper.throw(err);
    }
  }

  // T021, T044: Get all users (superadmin)
  async getAllUsers(): Promise<any[]> {
    try {
      const { data } = await firstValueFrom(this.http.get(`${this.baseUrl}/users`));
      return data;
    } catch (err) {
      this.errorMapper.throw(err);
    }
  }
}
