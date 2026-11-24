-- CreateTable
CREATE TABLE "saved_quack" (
    "userId" TEXT NOT NULL,
    "quackId" TEXT NOT NULL,
    "savedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_quack_pkey" PRIMARY KEY ("userId","quackId")
);

-- CreateIndex
CREATE INDEX "saved_quack_userId_savedAt_idx" ON "saved_quack"("userId", "savedAt");

-- CreateIndex
CREATE INDEX "saved_quack_quackId_idx" ON "saved_quack"("quackId");

-- AddForeignKey
ALTER TABLE "saved_quack" ADD CONSTRAINT "saved_quack_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_quack" ADD CONSTRAINT "saved_quack_quackId_fkey" FOREIGN KEY ("quackId") REFERENCES "quack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
