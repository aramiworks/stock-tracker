/**
 * Dev seed script — creates realistic Korean luxury brand fixtures for
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

  // Clean existing data for both users
  await prisma.tracker_accounts.deleteMany({
    where: { auth_user_id: { in: [user1.id, user2.id] } },
  });

  // --- User 1: 6 accounts ---
  const [
    cartierCheongdam,
    cartierLotte,
    hermesDoSan,
    lvCheongdam,
    chanelSinse,
    tiffanyHyundai,
  ] = await Promise.all([
    prisma.tracker_accounts.create({
      data: {
        auth_user_id: user1.id,
        store_name: "까르띠에 청담",
        sa_name: "김SA",
        notes: "담당 SA 10년차, 연락처 010-1234-5678",
      },
    }),
    prisma.tracker_accounts.create({
      data: {
        auth_user_id: user1.id,
        store_name: "까르띠에 롯데 본점",
        sa_name: "이SA",
        notes: "롯데 본점 1층",
      },
    }),
    prisma.tracker_accounts.create({
      data: {
        auth_user_id: user1.id,
        store_name: "에르메스 도산",
        sa_name: "박SA",
      },
    }),
    prisma.tracker_accounts.create({
      data: {
        auth_user_id: user1.id,
        store_name: "루이비통 청담",
        sa_name: "정SA",
        notes: "VIP 라운지 이용 가능",
      },
    }),
    prisma.tracker_accounts.create({
      data: {
        auth_user_id: user1.id,
        store_name: "샤넬 신세계",
        sa_name: "최SA",
      },
    }),
    prisma.tracker_accounts.create({
      data: {
        auth_user_id: user1.id,
        store_name: "티파니 현대",
        notes: "SA 미배정",
      },
    }),
  ]);

  // --- User 2: 2 accounts ---
  const [vanCleef, bulgari] = await Promise.all([
    prisma.tracker_accounts.create({
      data: {
        auth_user_id: user2.id,
        store_name: "반클리프 아펠 갤러리아",
        sa_name: "한SA",
        notes: "갤러리아 명품관 WEST",
      },
    }),
    prisma.tracker_accounts.create({
      data: {
        auth_user_id: user2.id,
        store_name: "불가리 롯데",
        sa_name: "윤SA",
      },
    }),
  ]);

  // --- Purchases: User 1 ---
  await prisma.tracker_purchases.createMany({
    data: [
      // 까르띠에 청담 — 10 purchases
      {
        tracker_account_id: cartierCheongdam.id,
        item_name: "러브 브레이슬릿 SM",
        item_category: "브레이슬릿",
        amount: 5800000,
        currency: "KRW",
        purchase_date: new Date("2024-03-15"),
        store_location: "청담",
      },
      {
        tracker_account_id: cartierCheongdam.id,
        item_name: "러브 브레이슬릿 다이아",
        item_category: "브레이슬릿",
        amount: 12500000,
        currency: "KRW",
        purchase_date: new Date("2024-06-20"),
        store_location: "청담",
      },
      {
        tracker_account_id: cartierCheongdam.id,
        item_name: "저스트 앵 끌루 브레이슬릿",
        item_category: "브레이슬릿",
        amount: 8900000,
        currency: "KRW",
        purchase_date: new Date("2024-09-10"),
        store_location: "청담",
      },
      {
        tracker_account_id: cartierCheongdam.id,
        item_name: "트리니티 링",
        item_category: "반지",
        amount: 2100000,
        currency: "KRW",
        purchase_date: new Date("2024-12-25"),
        store_location: "청담",
        notes: "크리스마스 선물",
      },
      {
        tracker_account_id: cartierCheongdam.id,
        item_name: "탱크 프랑세즈 워치",
        item_category: "시계",
        amount: 8500000,
        currency: "KRW",
        purchase_date: new Date("2025-01-15"),
        store_location: "청담",
      },
      {
        tracker_account_id: cartierCheongdam.id,
        item_name: "팬더 드 까르띠에 목걸이",
        item_category: "목걸이",
        amount: 15800000,
        currency: "KRW",
        purchase_date: new Date("2025-03-08"),
        store_location: "청담",
        notes: "특별 주문 제작",
      },
      {
        tracker_account_id: cartierCheongdam.id,
        item_name: "디아망 레제 귀걸이",
        item_category: "귀걸이",
        amount: 4200000,
        currency: "KRW",
        purchase_date: new Date("2025-05-01"),
        store_location: "청담",
      },
      {
        tracker_account_id: cartierCheongdam.id,
        item_name: "발롱 블루 워치 33mm",
        item_category: "시계",
        amount: 50000000,
        currency: "KRW",
        purchase_date: new Date("2025-07-20"),
        store_location: "청담",
        notes: "다이아몬드 베젤",
      },
      {
        tracker_account_id: cartierCheongdam.id,
        item_name: "러브 링 클래식",
        item_category: "반지",
        amount: 3850000,
        currency: "KRW",
        purchase_date: new Date("2025-09-14"),
        store_location: "청담",
      },
      {
        tracker_account_id: cartierCheongdam.id,
        item_name: "Santos de Cartier Watch",
        item_category: "시계",
        amount: 6200,
        currency: "USD",
        purchase_date: new Date("2025-11-28"),
        notes: "해외 출장 중 구매 (면세)",
      },
      // 까르띠에 롯데 — 4 purchases
      {
        tracker_account_id: cartierLotte.id,
        item_name: "아뮬레뜨 드 까르띠에 목걸이",
        item_category: "목걸이",
        amount: 3600000,
        currency: "KRW",
        purchase_date: new Date("2024-05-20"),
        store_location: "롯데 본점",
      },
      {
        tracker_account_id: cartierLotte.id,
        item_name: "C 드 까르띠에 지갑",
        item_category: "지갑",
        amount: 790000,
        currency: "KRW",
        purchase_date: new Date("2024-11-11"),
        store_location: "롯데 본점",
        notes: "빼빼로데이 선물",
      },
      {
        tracker_account_id: cartierLotte.id,
        item_name: "러브 브레이슬릿 옐로우골드",
        item_category: "브레이슬릿",
        amount: 9800000,
        currency: "KRW",
        purchase_date: new Date("2025-02-14"),
        store_location: "롯데 본점",
        notes: "발렌타인 구매",
      },
      {
        tracker_account_id: cartierLotte.id,
        item_name: "저스트 앵 끌루 링",
        item_category: "반지",
        amount: 3200000,
        currency: "KRW",
        purchase_date: new Date("2025-08-01"),
        store_location: "롯데 본점",
      },
      // 에르메스 도산 — 4 purchases
      {
        tracker_account_id: hermesDoSan.id,
        item_name: "버킨 25 토고",
        item_category: "가방",
        amount: 15900000,
        currency: "KRW",
        purchase_date: new Date("2024-07-10"),
        store_location: "도산",
        notes: "대기 6개월",
      },
      {
        tracker_account_id: hermesDoSan.id,
        item_name: "켈리 28 에프솜",
        item_category: "가방",
        amount: 18200000,
        currency: "KRW",
        purchase_date: new Date("2025-01-05"),
        store_location: "도산",
      },
      {
        tracker_account_id: hermesDoSan.id,
        item_name: "H 벨트 리버서블",
        item_category: "벨트",
        amount: 1280000,
        currency: "KRW",
        purchase_date: new Date("2025-04-18"),
        store_location: "도산",
      },
      {
        tracker_account_id: hermesDoSan.id,
        item_name: "Birkin 30 Togo",
        item_category: "가방",
        amount: 12800,
        currency: "USD",
        purchase_date: new Date("2025-10-05"),
        notes: "파리 본점 구매",
      },
      // 루이비통 청담 — 4 purchases
      {
        tracker_account_id: lvCheongdam.id,
        item_name: "카퓌신 MM",
        item_category: "가방",
        amount: 7900000,
        currency: "KRW",
        purchase_date: new Date("2024-04-25"),
        store_location: "청담",
      },
      {
        tracker_account_id: lvCheongdam.id,
        item_name: "탕뷔르 워치",
        item_category: "시계",
        amount: 22000000,
        currency: "KRW",
        purchase_date: new Date("2024-10-15"),
        store_location: "청담",
      },
      {
        tracker_account_id: lvCheongdam.id,
        item_name: "지피 월릿",
        item_category: "지갑",
        amount: 1350000,
        currency: "KRW",
        purchase_date: new Date("2025-06-01"),
        store_location: "청담",
      },
      {
        tracker_account_id: lvCheongdam.id,
        item_name: "LV Pont 9",
        item_category: "가방",
        amount: 3100,
        currency: "EUR",
        purchase_date: new Date("2025-12-20"),
        notes: "유럽 여행 중 구매",
      },
      // 샤넬 신세계 — 3 purchases
      {
        tracker_account_id: chanelSinse.id,
        item_name: "클래식 플랩 미듐",
        item_category: "가방",
        amount: 13900000,
        currency: "KRW",
        purchase_date: new Date("2024-08-30"),
        store_location: "신세계 본점",
      },
      {
        tracker_account_id: chanelSinse.id,
        item_name: "까멜리아 귀걸이",
        item_category: "귀걸이",
        amount: 850000,
        currency: "KRW",
        purchase_date: new Date("2025-03-20"),
        store_location: "신세계 본점",
      },
      {
        tracker_account_id: chanelSinse.id,
        item_name: "프리미에르 워치",
        item_category: "시계",
        amount: 7500000,
        currency: "KRW",
        purchase_date: new Date("2025-10-10"),
        store_location: "신세계 본점",
      },
      // 티파니 현대 — 2 purchases
      {
        tracker_account_id: tiffanyHyundai.id,
        item_name: "T1 링 내로우",
        item_category: "반지",
        amount: 2400000,
        currency: "KRW",
        purchase_date: new Date("2025-02-28"),
        store_location: "현대 압구정",
      },
      {
        tracker_account_id: tiffanyHyundai.id,
        item_name: "리턴 투 티파니 목걸이",
        item_category: "목걸이",
        amount: 380000,
        currency: "KRW",
        purchase_date: new Date("2025-07-07"),
        store_location: "현대 압구정",
      },
    ],
  });

  // --- Purchases: User 2 ---
  await prisma.tracker_purchases.createMany({
    data: [
      // 반클리프 아펠 갤러리아 — 3 purchases
      {
        tracker_account_id: vanCleef.id,
        item_name: "알함브라 빈티지 목걸이",
        item_category: "목걸이",
        amount: 5900000,
        currency: "KRW",
        purchase_date: new Date("2024-06-15"),
        store_location: "갤러리아",
      },
      {
        tracker_account_id: vanCleef.id,
        item_name: "스위트 알함브라 귀걸이",
        item_category: "귀걸이",
        amount: 3800000,
        currency: "KRW",
        purchase_date: new Date("2025-01-20"),
        store_location: "갤러리아",
      },
      {
        tracker_account_id: vanCleef.id,
        item_name: "Alhambra Bracelet 5 Motifs",
        item_category: "브레이슬릿",
        amount: 6300,
        currency: "USD",
        purchase_date: new Date("2025-08-15"),
        notes: "뉴욕 구매",
      },
      // 불가리 롯데 — 2 purchases
      {
        tracker_account_id: bulgari.id,
        item_name: "세르펜티 바이퍼 링",
        item_category: "반지",
        amount: 4500000,
        currency: "KRW",
        purchase_date: new Date("2024-09-01"),
        store_location: "롯데 본점",
      },
      {
        tracker_account_id: bulgari.id,
        item_name: "비제로원 목걸이",
        item_category: "목걸이",
        amount: 820000,
        currency: "JPY",
        purchase_date: new Date("2025-05-10"),
        notes: "도쿄 긴자 구매",
      },
    ],
  });

  console.log(
    `Done. Created 2 users, 8 accounts, 32 purchases spanning all categories.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
