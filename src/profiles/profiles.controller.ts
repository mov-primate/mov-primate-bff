import { Controller, Get, Headers } from '@nestjs/common';
import { ProfilesOrchestrationService } from './profiles-orchestration.service.js';
import { SessionService } from '../auth/session.service.js';

@Controller('bff/profiles')
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesOrchestrationService,
    private readonly sessionService: SessionService,
  ) {}

  // T009: Get own profile with booking history
  @Get('me')
  async getMyProfile(@Headers() headers: Record<string, any>) {
    const { userId } = this.sessionService.extractSession(headers);
    return this.profilesService.getProfile(userId);
  }
}
