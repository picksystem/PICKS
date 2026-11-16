-- Per-user leave/time-off balances + submitted requests (dynamic dashboard data)

CREATE TABLE "UserLeaveBalance" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "leaveType" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "consumed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "available" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLeaveBalance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserLeaveRequest" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "leaveType" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "days" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLeaveRequest_pkey" PRIMARY KEY ("id")
);

-- One balance row per user per leave type
CREATE UNIQUE INDEX "UserLeaveBalance_userId_leaveType_key" ON "UserLeaveBalance"("userId", "leaveType");

CREATE INDEX "UserLeaveRequest_userId_idx" ON "UserLeaveRequest"("userId");
