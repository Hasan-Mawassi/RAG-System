-- CreateTable
CREATE TABLE "MessageSources" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "sourcesJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageSources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MessageSources_messageId_key" ON "MessageSources"("messageId");

-- AddForeignKey
ALTER TABLE "MessageSources" ADD CONSTRAINT "MessageSources_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
