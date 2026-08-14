CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED', 'DELETED');
CREATE TYPE "WorkspaceType" AS ENUM ('PERSONAL', 'FAMILY');
CREATE TYPE "MembershipRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');
CREATE TYPE "MembershipStatus" AS ENUM ('INVITED', 'ACTIVE', 'SUSPENDED', 'REMOVED');
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED');
CREATE TYPE "CategoryKind" AS ENUM ('EXPENSE', 'INCOME');
CREATE TYPE "AccountType" AS ENUM ('CASH', 'BANK', 'CREDIT_CARD', 'SAVINGS', 'INVESTMENT', 'DIGITAL_WALLET', 'OTHER');
CREATE TYPE "AccountVisibility" AS ENUM ('PERSONAL', 'SHARED');
CREATE TYPE "TransactionType" AS ENUM ('EXPENSE', 'INCOME', 'TRANSFER');
CREATE TYPE "MovementType" AS ENUM ('DEBIT', 'CREDIT');
CREATE TYPE "BudgetScope" AS ENUM ('WORKSPACE', 'PERSONAL', 'CATEGORY');
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'INVITE', 'ROLE_CHANGE', 'MEMBER_REMOVE', 'PASSWORD_RESET', 'OWNERSHIP_TRANSFER', 'EXPORT');

CREATE TABLE "users" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "email" VARCHAR(320) NOT NULL,
  "password_hash" VARCHAR(255) NOT NULL,
  "first_name" VARCHAR(80) NOT NULL,
  "last_name" VARCHAR(80) NOT NULL,
  "avatar_url" VARCHAR(500),
  "status" "UserStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
  "email_verified_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_status_idx" ON "users"("status");

CREATE TABLE "workspaces" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" VARCHAR(120) NOT NULL,
  "type" "WorkspaceType" NOT NULL,
  "owner_user_id" UUID NOT NULL,
  "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
  "timezone" VARCHAR(64) NOT NULL DEFAULT 'UTC',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "workspaces_type_idx" ON "workspaces"("type");
CREATE INDEX "workspaces_owner_user_id_idx" ON "workspaces"("owner_user_id");

CREATE TABLE "sessions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "refresh_token_hash" VARCHAR(255) NOT NULL,
  "token_family" VARCHAR(64) NOT NULL,
  "ip_hash" VARCHAR(128),
  "user_agent" VARCHAR(500),
  "expires_at" TIMESTAMP(3) NOT NULL,
  "revoked_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "sessions_refresh_token_hash_key" ON "sessions"("refresh_token_hash");
CREATE INDEX "sessions_user_id_revoked_at_idx" ON "sessions"("user_id", "revoked_at");
CREATE INDEX "sessions_token_family_idx" ON "sessions"("token_family");

CREATE TABLE "workspace_memberships" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "role" "MembershipRole" NOT NULL DEFAULT 'MEMBER',
  "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
  "display_name" VARCHAR(120),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "workspace_memberships_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "workspace_memberships_workspace_id_user_id_key" ON "workspace_memberships"("workspace_id", "user_id");
CREATE INDEX "workspace_memberships_user_id_status_idx" ON "workspace_memberships"("user_id", "status");
CREATE INDEX "workspace_memberships_workspace_id_status_idx" ON "workspace_memberships"("workspace_id", "status");

CREATE TABLE "invitations" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id" UUID NOT NULL,
  "email" VARCHAR(320) NOT NULL,
  "role" "MembershipRole" NOT NULL DEFAULT 'MEMBER',
  "token_hash" VARCHAR(255) NOT NULL,
  "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
  "expires_at" TIMESTAMP(3) NOT NULL,
  "accepted_at" TIMESTAMP(3),
  "revoked_at" TIMESTAMP(3),
  "invited_by_user_id" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "invitations_token_hash_key" ON "invitations"("token_hash");
CREATE INDEX "invitations_workspace_id_status_idx" ON "invitations"("workspace_id", "status");
CREATE INDEX "invitations_email_status_idx" ON "invitations"("email", "status");

CREATE TABLE "categories" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id" UUID NOT NULL,
  "kind" "CategoryKind" NOT NULL DEFAULT 'EXPENSE',
  "name" VARCHAR(80) NOT NULL,
  "normalized_name" VARCHAR(80) NOT NULL,
  "icon" VARCHAR(80),
  "color" VARCHAR(16),
  "parent_id" UUID,
  "position" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_by_user_id" UUID NOT NULL,
  "created_by_membership_id" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "categories_workspace_id_kind_parent_id_normalized_name_key" ON "categories"("workspace_id", "kind", "parent_id", "normalized_name");
CREATE INDEX "categories_workspace_id_is_active_position_idx" ON "categories"("workspace_id", "is_active", "position");

CREATE TABLE "accounts" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id" UUID NOT NULL,
  "owner_membership_id" UUID,
  "visibility" "AccountVisibility" NOT NULL DEFAULT 'SHARED',
  "name" VARCHAR(120) NOT NULL,
  "type" "AccountType" NOT NULL,
  "currency" VARCHAR(3) NOT NULL,
  "initial_balance_minor" BIGINT NOT NULL DEFAULT 0,
  "current_balance_minor" BIGINT NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "accounts_workspace_id_is_active_idx" ON "accounts"("workspace_id", "is_active");
CREATE INDEX "accounts_workspace_id_owner_membership_id_idx" ON "accounts"("workspace_id", "owner_membership_id");

CREATE TABLE "transactions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id" UUID NOT NULL,
  "type" "TransactionType" NOT NULL,
  "amount_minor" BIGINT NOT NULL,
  "currency" VARCHAR(3) NOT NULL,
  "category_id" UUID,
  "account_id" UUID,
  "destination_account_id" UUID,
  "created_by_membership_id" UUID NOT NULL,
  "paid_by_membership_id" UUID,
  "deleted_by_membership_id" UUID,
  "occurred_at" TIMESTAMP(3) NOT NULL,
  "description" VARCHAR(160) NOT NULL,
  "notes" VARCHAR(2000),
  "receipt_url" VARCHAR(1000),
  "deleted_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_by_user_id" UUID,
  CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "transactions_workspace_id_occurred_at_id_idx" ON "transactions"("workspace_id", "occurred_at", "id");
CREATE INDEX "transactions_workspace_id_type_occurred_at_idx" ON "transactions"("workspace_id", "type", "occurred_at");
CREATE INDEX "transactions_workspace_id_category_id_occurred_at_idx" ON "transactions"("workspace_id", "category_id", "occurred_at");
CREATE INDEX "transactions_workspace_id_created_by_membership_id_occurred_at_idx" ON "transactions"("workspace_id", "created_by_membership_id", "occurred_at");
CREATE INDEX "transactions_workspace_id_deleted_at_idx" ON "transactions"("workspace_id", "deleted_at");

CREATE TABLE "account_movements" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id" UUID NOT NULL,
  "transaction_id" UUID NOT NULL,
  "account_id" UUID NOT NULL,
  "movement_type" "MovementType" NOT NULL,
  "amount_minor" BIGINT NOT NULL,
  "occurred_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "account_movements_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "account_movements_transaction_id_account_id_movement_type_key" ON "account_movements"("transaction_id", "account_id", "movement_type");
CREATE INDEX "account_movements_workspace_id_account_id_occurred_at_idx" ON "account_movements"("workspace_id", "account_id", "occurred_at");

CREATE TABLE "budgets" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id" UUID NOT NULL,
  "scope" "BudgetScope" NOT NULL,
  "owner_membership_id" UUID,
  "category_id" UUID,
  "period_start" DATE NOT NULL,
  "period_end" DATE NOT NULL,
  "amount_minor" BIGINT NOT NULL,
  "currency" VARCHAR(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "budgets_workspace_id_period_start_period_end_idx" ON "budgets"("workspace_id", "period_start", "period_end");
CREATE INDEX "budgets_workspace_id_category_id_idx" ON "budgets"("workspace_id", "category_id");

CREATE TABLE "audit_logs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "workspace_id" UUID,
  "actor_user_id" UUID,
  "action" "AuditAction" NOT NULL,
  "entity_type" VARCHAR(80) NOT NULL,
  "entity_id" UUID,
  "metadata" JSONB,
  "ip_hash" VARCHAR(128),
  "user_agent" VARCHAR(500),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "audit_logs_workspace_id_created_at_idx" ON "audit_logs"("workspace_id", "created_at");
CREATE INDEX "audit_logs_entity_type_entity_id_created_at_idx" ON "audit_logs"("entity_type", "entity_id", "created_at");

ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "workspace_memberships" ADD CONSTRAINT "workspace_memberships_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "workspace_memberships" ADD CONSTRAINT "workspace_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_user_id_fkey" FOREIGN KEY ("invited_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "categories" ADD CONSTRAINT "categories_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "categories" ADD CONSTRAINT "categories_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "categories" ADD CONSTRAINT "categories_created_by_membership_id_fkey" FOREIGN KEY ("created_by_membership_id") REFERENCES "workspace_memberships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_owner_membership_id_fkey" FOREIGN KEY ("owner_membership_id") REFERENCES "workspace_memberships"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_destination_account_id_fkey" FOREIGN KEY ("destination_account_id") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_created_by_membership_id_fkey" FOREIGN KEY ("created_by_membership_id") REFERENCES "workspace_memberships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_paid_by_membership_id_fkey" FOREIGN KEY ("paid_by_membership_id") REFERENCES "workspace_memberships"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_deleted_by_membership_id_fkey" FOREIGN KEY ("deleted_by_membership_id") REFERENCES "workspace_memberships"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_deleted_by_user_id_fkey" FOREIGN KEY ("deleted_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "account_movements" ADD CONSTRAINT "account_movements_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "account_movements" ADD CONSTRAINT "account_movements_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "account_movements" ADD CONSTRAINT "account_movements_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_owner_membership_id_fkey" FOREIGN KEY ("owner_membership_id") REFERENCES "workspace_memberships"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
