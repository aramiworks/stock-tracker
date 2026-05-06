/**
 * Dev seed script — creates realistic Hermès Korea restock alert fixtures for
 * local development. Safe to run multiple times (cleans + recreates).
 *
 * Usage: npm run seed:dev -w packages/prisma
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEV_USER_1 = {
  supabaseId: "11111111-1111-1111-1111-111111111111",
  email: "dev@arami.so",
  displayName: "개발자",
};

const DEV_USER_2 = {
  supabaseId: "22222222-2222-2222-2222-222222222222",
  email: "dev2@arami.so",
  displayName: "테스트유저",
};

async function main() {
  console.log("Seeding dev data...");

  // Upsert users
  const user1 = await prisma.auth_users.upsert({
    where: { supabase_id: DEV_USER_1.supabaseId },
    create: {
      supabase_id: DEV_USER_1.supabaseId,
      email: DEV_USER_1.email,
      display_name: DEV_USER_1.displayName,
    },
    update: {
      email: DEV_USER_1.email,
      display_name: DEV_USER_1.displayName,
    },
  });

  const user2 = await prisma.auth_users.upsert({
    where: { supabase_id: DEV_USER_2.supabaseId },
    create: {
      supabase_id: DEV_USER_2.supabaseId,
      email: DEV_USER_2.email,
      display_name: DEV_USER_2.displayName,
    },
    update: {
      email: DEV_USER_2.email,
      display_name: DEV_USER_2.displayName,
    },
  });

  // Clean existing watchlist data for both users (cascade deletes alerts)
  await prisma.watches.deleteMany({
    where: {
      auth_user_id: { in: [user1.supabase_id, user2.supabase_id] },
    },
  });

  // Clean catalog + drop events (shared data — recreate fresh)
  await prisma.drop_events.deleteMany({});
  await prisma.skus.deleteMany({});
  await prisma.watchable_units.deleteMany({});

  // --- Catalog: Hermès ---

  const birkin25 = await prisma.watchable_units.create({
    data: {
      brand: "Hermes",
      product_line: "Birkin",
      model_name: "Birkin 25",
    },
  });

  const birkin30 = await prisma.watchable_units.create({
    data: {
      brand: "Hermes",
      product_line: "Birkin",
      model_name: "Birkin 30",
    },
  });

  const kelly28 = await prisma.watchable_units.create({
    data: {
      brand: "Hermes",
      product_line: "Kelly",
      model_name: "Kelly 28 Sellier",
    },
  });

  const kelly32 = await prisma.watchable_units.create({
    data: {
      brand: "Hermes",
      product_line: "Kelly",
      model_name: "Kelly 32 Retourne",
    },
  });

  const lindy26 = await prisma.watchable_units.create({
    data: {
      brand: "Hermes",
      product_line: "Lindy",
      model_name: "Lindy 26",
    },
  });

  // --- SKUs: Birkin 25 ---

  const birkin25NoirTogo = await prisma.skus.create({
    data: {
      watchable_unit_id: birkin25.id,
      color: "Noir",
      leather: "Togo",
      hardware: "GHW",
      size: "25",
    },
  });

  const birkin25EtoupeTogo = await prisma.skus.create({
    data: {
      watchable_unit_id: birkin25.id,
      color: "Etoupe",
      leather: "Togo",
      hardware: "PHW",
      size: "25",
    },
  });

  await prisma.skus.create({
    data: {
      watchable_unit_id: birkin25.id,
      color: "Gold",
      leather: "Epsom",
      hardware: "GHW",
      size: "25",
    },
  });

  // --- SKUs: Birkin 30 ---

  const birkin30NoirTogo = await prisma.skus.create({
    data: {
      watchable_unit_id: birkin30.id,
      color: "Noir",
      leather: "Togo",
      hardware: "GHW",
      size: "30",
    },
  });

  await prisma.skus.create({
    data: {
      watchable_unit_id: birkin30.id,
      color: "Etoupe",
      leather: "Swift",
      hardware: "PHW",
      size: "30",
    },
  });

  // --- SKUs: Kelly 28 ---

  const kelly28NoirEpsom = await prisma.skus.create({
    data: {
      watchable_unit_id: kelly28.id,
      color: "Noir",
      leather: "Epsom",
      hardware: "GHW",
      size: "28",
    },
  });

  await prisma.skus.create({
    data: {
      watchable_unit_id: kelly28.id,
      color: "Rouge H",
      leather: "Togo",
      hardware: "GHW",
      size: "28",
    },
  });

  // --- SKUs: Kelly 32 ---

  const kelly32EtoupeTogoRHW = await prisma.skus.create({
    data: {
      watchable_unit_id: kelly32.id,
      color: "Etoupe",
      leather: "Togo",
      hardware: "RHW",
      size: "32",
    },
  });

  // --- SKUs: Lindy 26 ---

  const lindy26EtoupeSwift = await prisma.skus.create({
    data: {
      watchable_unit_id: lindy26.id,
      color: "Etoupe",
      leather: "Swift",
      hardware: "PHW",
      size: "26",
    },
  });

  // --- Drop events (recent restocks) ---

  const drop1 = await prisma.drop_events.create({
    data: {
      sku_id: birkin25NoirTogo.id,
      source_url: "https://www.hermes.com/kr/ko/",
      detected_at: new Date("2026-04-20T09:15:00Z"),
      expired_at: new Date("2026-04-20T11:00:00Z"),
    },
  });

  const drop2 = await prisma.drop_events.create({
    data: {
      sku_id: kelly28NoirEpsom.id,
      source_url: "https://www.hermes.com/kr/ko/",
      detected_at: new Date("2026-04-22T10:30:00Z"),
      expired_at: new Date("2026-04-22T12:00:00Z"),
    },
  });

  await prisma.drop_events.create({
    data: {
      sku_id: birkin30NoirTogo.id,
      source_url: "https://www.hermes.com/kr/ko/",
      detected_at: new Date("2026-05-01T08:45:00Z"),
      // Not expired yet — still live
    },
  });

  const drop4 = await prisma.drop_events.create({
    data: {
      sku_id: birkin25EtoupeTogo.id,
      source_url: "https://www.hermes.com/kr/ko/",
      detected_at: new Date("2026-05-03T14:00:00Z"),
    },
  });

  // --- User 1 watches: Birkin 25 (two SKUs) + Kelly 28 Noir + Birkin 30 (unit-level) ---

  const watch1u1 = await prisma.watches.create({
    data: {
      auth_user_id: user1.supabase_id,
      watchable_unit_id: birkin25.id,
      sku_id: birkin25NoirTogo.id,
      notify_push: true,
      notify_email: false,
    },
  });

  const watch2u1 = await prisma.watches.create({
    data: {
      auth_user_id: user1.supabase_id,
      watchable_unit_id: birkin25.id,
      sku_id: birkin25EtoupeTogo.id,
      notify_push: true,
      notify_email: true,
    },
  });

  const watch3u1 = await prisma.watches.create({
    data: {
      auth_user_id: user1.supabase_id,
      watchable_unit_id: kelly28.id,
      sku_id: kelly28NoirEpsom.id,
      notify_push: true,
      notify_email: false,
    },
  });

  // Unit-level watch (any SKU of Birkin 30)
  await prisma.watches.create({
    data: {
      auth_user_id: user1.supabase_id,
      watchable_unit_id: birkin30.id,
      sku_id: null,
      notify_push: true,
      notify_email: false,
    },
  });

  // --- User 2 watches: Kelly 32 + Lindy 26 ---

  await prisma.watches.create({
    data: {
      auth_user_id: user2.supabase_id,
      watchable_unit_id: kelly32.id,
      sku_id: kelly32EtoupeTogoRHW.id,
      notify_push: true,
      notify_email: false,
    },
  });

  await prisma.watches.create({
    data: {
      auth_user_id: user2.supabase_id,
      watchable_unit_id: lindy26.id,
      sku_id: lindy26EtoupeSwift.id,
      notify_push: true,
      notify_email: true,
    },
  });

  // --- Alerts: past drop events notified to matching watches ---

  await prisma.alerts.createMany({
    data: [
      // drop1 (Birkin 25 Noir Togo) → watch1u1
      {
        watch_id: watch1u1.id,
        drop_event_id: drop1.id,
        channel: "push",
        sent_at: new Date("2026-04-20T09:15:05Z"),
        read_at: new Date("2026-04-20T09:20:00Z"),
      },
      // drop2 (Kelly 28 Noir Epsom) → watch3u1
      {
        watch_id: watch3u1.id,
        drop_event_id: drop2.id,
        channel: "push",
        sent_at: new Date("2026-04-22T10:30:08Z"),
        read_at: null,
      },
      // drop4 (Birkin 25 Etoupe Togo) → watch2u1 — both push and email
      {
        watch_id: watch2u1.id,
        drop_event_id: drop4.id,
        channel: "push",
        sent_at: new Date("2026-05-03T14:00:04Z"),
        read_at: null,
      },
      {
        watch_id: watch2u1.id,
        drop_event_id: drop4.id,
        channel: "email",
        sent_at: new Date("2026-05-03T14:00:06Z"),
        read_at: null,
      },
    ],
  });

  console.log(
    "Done. Created 2 users, 5 watchable units, 9 SKUs, 6 watches, 4 drop events, 4 alerts.",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
