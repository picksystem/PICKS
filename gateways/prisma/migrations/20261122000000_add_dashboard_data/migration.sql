-- Dashboard reference data (global, admin-managed)

CREATE TABLE "UserDashboardItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserDashboardItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserApprovalItem" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'MoreTime',
    "count" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserApprovalItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserEvent" (
    "id" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserHoliday" (
    "id" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserHoliday_pkey" PRIMARY KEY ("id")
);
