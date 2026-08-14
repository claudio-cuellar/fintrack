import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { IsOptional, IsString, Length } from 'class-validator';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { AuthenticatedUser } from '../common/auth.types';
import { CurrentUser } from '../common/decorators/auth.decorators';
import { JwtAuthGuard } from '../common/guards/security.guards';

class UpdateMeDto { @IsOptional() @IsString() @Length(2, 80) firstName?: string; @IsOptional() @IsString() @Length(2, 80) lastName?: string; }

@Controller('me')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}
  @Get() async get(@CurrentUser() user: AuthenticatedUser) { const data = await this.prisma.user.findUniqueOrThrow({ where: { id: user.userId }, select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true, status: true, createdAt: true } }); return { data }; }
  @Patch() async update(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateMeDto) { const data = await this.prisma.user.update({ where: { id: user.userId }, data: dto, select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true, status: true, createdAt: true } }); return { data }; }
}
