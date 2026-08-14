import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/auth.decorators';
import { PrismaService } from '../infrastructure/prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}
  @Public() @Get() liveness() { return { status: 'ok', service: 'fintrack-api', timestamp: new Date().toISOString() }; }
  @Public() @Get('ready') async readiness() { await this.prisma.$queryRaw`SELECT 1`; return { status: 'ready', database: 'ok' }; }
}
