-- CreateTable
CREATE TABLE "videos" (
    "id" TEXT NOT NULL,
    "savedVideoName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "videos_savedVideoName_key" ON "videos"("savedVideoName");
