-- CreateTable
CREATE TABLE "ToggleState" (
    "id" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ToggleState_pkey" PRIMARY KEY ("id")
);
