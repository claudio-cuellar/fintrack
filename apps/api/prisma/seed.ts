import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, CategoryKind, MembershipRole, MembershipStatus, UserStatus, WorkspaceType, AccountType, AccountVisibility } from '@prisma/client';
import * as argon2 from 'argon2';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await argon2.hash('ChangeMe123!ChangeMe123!', { type: argon2.argon2id });
  const user = await prisma.user.upsert({
    where: { email: 'demo@fintrack.local' },
    update: { status: UserStatus.ACTIVE, emailVerifiedAt: new Date() },
    create: { email: 'demo@fintrack.local', passwordHash, firstName: 'Demo', lastName: 'User', status: UserStatus.ACTIVE, emailVerifiedAt: new Date() },
  });

  let workspace = await prisma.workspace.findFirst({ where: { ownerUserId: user.id } });
  if (!workspace) {
    workspace = await prisma.workspace.create({ data: { name: 'Demo Household', type: WorkspaceType.FAMILY, ownerUserId: user.id } });
  }
  const ownerMembership = await prisma.workspaceMembership.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: user.id } },
    update: { role: MembershipRole.OWNER, status: MembershipStatus.ACTIVE },
    create: { workspaceId: workspace.id, userId: user.id, role: MembershipRole.OWNER, status: MembershipStatus.ACTIVE, displayName: 'Demo User' },
  });

  const defaults = [
    ['Housing', 'house'], ['Food', 'utensils'], ['Transportation', 'car'], ['Utilities', 'zap'],
    ['Entertainment', 'film'], ['Healthcare', 'heart-pulse'], ['Education', 'book-open'],
    ['Shopping', 'shopping-bag'], ['Travel', 'plane'], ['Subscriptions', 'repeat'], ['Other', 'ellipsis'],
  ];
  for (const [name, icon] of defaults) {
    const normalizedName = name.toLowerCase();
    const existing = await prisma.category.findFirst({ where: { workspaceId: workspace.id, kind: CategoryKind.EXPENSE, parentId: null, normalizedName } });
    if (!existing) await prisma.category.create({ data: { workspaceId: workspace.id, kind: CategoryKind.EXPENSE, name, normalizedName, icon, position: defaults.findIndex(([n]) => n === name), createdByUserId: user.id, createdByMembershipId: ownerMembership.id } });
  }
  const account = await prisma.account.findFirst({ where: { workspaceId: workspace.id, name: 'Checking' } });
  if (!account) await prisma.account.create({ data: { workspaceId: workspace.id, name: 'Checking', type: AccountType.BANK, visibility: AccountVisibility.SHARED, currency: 'USD', initialBalanceMinor: 0, currentBalanceMinor: 0 } });
  console.log(`Seeded ${user.email} in workspace ${workspace.id}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
