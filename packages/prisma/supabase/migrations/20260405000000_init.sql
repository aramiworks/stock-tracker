-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "auth_users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "supabase_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracker_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "auth_user_id" UUID NOT NULL,
    "store_name" TEXT NOT NULL,
    "sa_name" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tracker_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracker_purchases" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tracker_account_id" UUID NOT NULL,
    "item_name" TEXT NOT NULL,
    "item_category" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KRW',
    "purchase_date" TIMESTAMP(3) NOT NULL,
    "store_location" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tracker_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_users_supabase_id_key" ON "auth_users"("supabase_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_users_email_key" ON "auth_users"("email");

-- AddForeignKey
ALTER TABLE "tracker_accounts" ADD CONSTRAINT "tracker_accounts_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth_users"("supabase_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracker_purchases" ADD CONSTRAINT "tracker_purchases_tracker_account_id_fkey" FOREIGN KEY ("tracker_account_id") REFERENCES "tracker_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
