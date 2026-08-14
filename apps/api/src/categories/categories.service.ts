import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditAction, CategoryKind } from '@prisma/client';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { WorkspaceContext } from '../common/auth.types';
import { CreateCategoryDto, UpdateCategoryDto } from './categories.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  list(context: WorkspaceContext, includeArchived = false) {
    return this.prisma.category.findMany({ where: { workspaceId: context.workspaceId, ...(includeArchived ? {} : { isActive: true }) }, orderBy: [{ position: 'asc' }, { name: 'asc' }] });
  }

  async create(context: WorkspaceContext, userId: string, dto: CreateCategoryDto) {
    const kind = dto.kind || CategoryKind.EXPENSE;
    const normalizedName = dto.name.trim().toLowerCase();
    if (dto.parentId) await this.assertCategory(context.workspaceId, dto.parentId);
    const duplicate = await this.prisma.category.findFirst({ where: { workspaceId: context.workspaceId, kind, parentId: dto.parentId || null, normalizedName } });
    if (duplicate) throw new ConflictException('A category with this name already exists');
    const category = await this.prisma.category.create({ data: { workspaceId: context.workspaceId, kind, name: dto.name.trim(), normalizedName, icon: dto.icon, color: dto.color, parentId: dto.parentId, position: dto.position ?? 0, createdByUserId: userId, createdByMembershipId: context.membershipId } });
    await this.audit.record({ action: AuditAction.CREATE, entityType: 'Category', entityId: category.id, workspaceId: context.workspaceId, actorUserId: userId });
    return category;
  }

  async update(context: WorkspaceContext, userId: string, id: string, dto: UpdateCategoryDto) {
    const existing = await this.assertCategory(context.workspaceId, id);
    if (dto.parentId) await this.assertCategory(context.workspaceId, dto.parentId);
    const data = { ...dto, ...(dto.name ? { name: dto.name.trim(), normalizedName: dto.name.trim().toLowerCase() } : {}) };
    const category = await this.prisma.category.update({ where: { id: existing.id }, data });
    await this.audit.record({ action: AuditAction.UPDATE, entityType: 'Category', entityId: id, workspaceId: context.workspaceId, actorUserId: userId, metadata: { isActive: dto.isActive } });
    return category;
  }

  async archive(context: WorkspaceContext, userId: string, id: string) { return this.update(context, userId, id, { isActive: false }); }

  private async assertCategory(workspaceId: string, id: string) {
    const row = await this.prisma.category.findFirst({ where: { id, workspaceId } });
    if (!row) throw new NotFoundException('Category not found');
    return row;
  }
}
