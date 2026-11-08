import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { createObserveModule } from '@nestjs/observe';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthMiddleware } from './auth/auth.middleware';
import { SessionService } from './auth/session.service';

import { ErrorMapperService } from './shared/errors/error-mapper.service';
import { RoleGuard } from './shared/guards/role.guard';

import { AlumnosHttpService } from './http/alumnos-http.service';
import { AgendaHttpService } from './http/agenda-http.service';
import { ApiHttpService } from './http/api-http.service';

import { NotificationOrchestrationService } from './notifications/notification-orchestration.service';

import { BookingOrchestrationService } from './booking/booking-orchestration.service';
import { BookingController } from './booking/booking.controller';

import { SlotsOrchestrationService } from './slots/slots-orchestration.service';
import { SlotsController } from './slots/slots.controller';

import { ProfilesOrchestrationService } from './profiles/profiles-orchestration.service';
import { ProfilesController } from './profiles/profiles.controller';

import { AdminOrchestrationService } from './admin/admin-orchestration.service';
import { AdminController } from './admin/admin.controller';

import { SuperadminOrchestrationService } from './superadmin/superadmin-orchestration.service';
import { SuperadminController } from './superadmin/superadmin.controller';

import { AttendanceOrchestrationService } from './attendance/attendance-orchestration.service';
import { AttendanceController } from './attendance/attendance.controller';

import { AuditOrchestrationService } from './audit/audit-orchestration.service';
import { AuditController } from './audit/audit.controller';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
      appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
      serviceId: 'mov-primate-bff',
    }),
  ],
  controllers: [
    AppController,
    BookingController,
    SlotsController,
    ProfilesController,
    AdminController,
    SuperadminController,
    AttendanceController,
    AuditController,
  ],
  providers: [
    AppService,
    SessionService,
    ErrorMapperService,
    RoleGuard,
    AlumnosHttpService,
    AgendaHttpService,
    ApiHttpService,
    NotificationOrchestrationService,
    BookingOrchestrationService,
    SlotsOrchestrationService,
    ProfilesOrchestrationService,
    AdminOrchestrationService,
    SuperadminOrchestrationService,
    AttendanceOrchestrationService,
    AuditOrchestrationService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude('/')
      .forRoutes('bff/*path');
  }
}

