-- CreateTable
CREATE TABLE "videos" (
    "id" TEXT NOT NULL,
    "saved_video_name" TEXT NOT NULL,
    "original_video_name" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "videos_saved_video_name_key" ON "videos"("saved_video_name");
