-- CreateTable
CREATE TABLE "blog_clap" (
    "id" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_clap_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "blog_clap_blogId_idx" ON "blog_clap"("blogId");

-- CreateIndex
CREATE UNIQUE INDEX "blog_clap_blogId_ipHash_key" ON "blog_clap"("blogId", "ipHash");

-- AddForeignKey
ALTER TABLE "blog_clap" ADD CONSTRAINT "blog_clap_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
