-- CreateEnum
CREATE TYPE "OtpUseCase" AS ENUM ('LOGIN', 'D2FA', 'PHV');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "twoFA" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFAPhone" TEXT,
ADD COLUMN     "twoFAPhoneVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "otp" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "useCase" "OtpUseCase" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "otp_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "otp" ADD CONSTRAINT "otp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
