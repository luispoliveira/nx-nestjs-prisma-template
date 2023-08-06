-- AlterTable
ALTER TABLE "log" ADD COLUMN     "headers" JSONB;

-- AlterTable
ALTER TABLE "permission_2_role" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "permission_2_user" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "role_2_user" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
