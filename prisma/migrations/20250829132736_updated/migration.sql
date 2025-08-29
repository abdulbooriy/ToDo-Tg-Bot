-- CreateTable
CREATE TABLE "public"."Todo" (
    "id" SERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "taskName" TEXT NOT NULL,
    "taskTime" TIMESTAMP(3) NOT NULL,
    "taskLevel" TEXT,
    "status" TEXT NOT NULL DEFAULT 'faol',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Todo_pkey" PRIMARY KEY ("id")
);
