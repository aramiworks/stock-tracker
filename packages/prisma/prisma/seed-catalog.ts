/**
 * Catalog seed — creates MVP watchable_units + SKUs for local development.
 * MVP scope: Hermes bags (Birkin/Kelly excluded) + 4 Cartier Tank Must watches.
 *
 * Safe to run multiple times (upsert on [brand, model_name] unique constraint).
 *
 * Usage: npx tsx packages/prisma/prisma/seed-catalog.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// -- Hermes bags (online-sold, Birkin/Kelly excluded) -------------------------

const hermesUnits = [
  // Bolide
  { productLine: "Bolide", modelName: "Bolide Mini" },
  { productLine: "Bolide", modelName: "Bolide 27" },
  { productLine: "Bolide", modelName: "Bolide 31" },
  // Evelyne
  { productLine: "Evelyne", modelName: "Evelyne 29" },
  { productLine: "Evelyne", modelName: "Evelyne 33" },
  // Picotin
  { productLine: "Picotin", modelName: "Picotin 18" },
  { productLine: "Picotin", modelName: "Picotin 22" },
  // Lindy
  { productLine: "Lindy", modelName: "Lindy Mini" },
  { productLine: "Lindy", modelName: "Lindy 26" },
  { productLine: "Lindy", modelName: "Lindy 30" },
  // Garden Party
  { productLine: "Garden Party", modelName: "Garden Party 30" },
  { productLine: "Garden Party", modelName: "Garden Party 36" },
  // Constance
  { productLine: "Constance", modelName: "Constance Mini" },
  { productLine: "Constance", modelName: "Constance 18" },
  { productLine: "Constance", modelName: "Constance 24" },
  // Herbag
  { productLine: "Herbag", modelName: "Herbag 31" },
  { productLine: "Herbag", modelName: "Herbag 39" },
  // Halzan
  { productLine: "Halzan", modelName: "Halzan Mini" },
  { productLine: "Halzan", modelName: "Halzan 25" },
  { productLine: "Halzan", modelName: "Halzan 31" },
  // Roulis
  { productLine: "Roulis", modelName: "Roulis Mini" },
  { productLine: "Roulis", modelName: "Roulis 18" },
  { productLine: "Roulis", modelName: "Roulis 23" },
  // 24/24
  { productLine: "24/24", modelName: "24/24 21" },
  { productLine: "24/24", modelName: "24/24 29" },
  { productLine: "24/24", modelName: "24/24 35" },
  // Della Cavalleria
  { productLine: "Della Cavalleria", modelName: "Della Cavalleria Mini" },
  // In-the-Loop
  { productLine: "In-the-Loop", modelName: "In-the-Loop 18" },
  { productLine: "In-the-Loop", modelName: "In-the-Loop 23" },
];

// -- Cartier watches (exactly 4 references, all Tank Must) --------------------

const cartierUnits = [
  {
    productLine: "Tank",
    modelName: "Tank Must Large Steel",
    referenceCode: "WSTA0106",
  },
  {
    productLine: "Tank",
    modelName: "Tank Must Small Steel",
    referenceCode: "WSTA0107",
  },
  {
    productLine: "Tank",
    modelName: "Tank Must Small Leather",
    referenceCode: "WSTA0135",
  },
  {
    productLine: "Tank",
    modelName: "Tank Must Large Leather",
    referenceCode: "WSTA0136",
  },
];

async function main() {
  console.log("Seeding catalog data...");

  // Seed Hermes units
  for (const unit of hermesUnits) {
    await prisma.watchable_units.upsert({
      where: {
        brand_model_name: { brand: "Hermes", model_name: unit.modelName },
      },
      create: {
        brand: "Hermes",
        product_line: unit.productLine,
        model_name: unit.modelName,
        active: true,
      },
      update: {
        product_line: unit.productLine,
        active: true,
      },
    });
  }

  console.log(`  Hermes: ${hermesUnits.length} units`);

  // Seed Cartier units + SKUs (one SKU per reference)
  for (const unit of cartierUnits) {
    const created = await prisma.watchable_units.upsert({
      where: {
        brand_model_name: { brand: "Cartier", model_name: unit.modelName },
      },
      create: {
        brand: "Cartier",
        product_line: unit.productLine,
        model_name: unit.modelName,
        active: true,
      },
      update: {
        product_line: unit.productLine,
        active: true,
      },
    });

    // Each Cartier reference maps 1:1 to a SKU
    const size = unit.modelName.includes("Small") ? "Small" : "Large";
    const hardware = unit.modelName.includes("Leather") ? "Leather" : "Steel";

    await prisma.skus.upsert({
      where: { reference_code: unit.referenceCode },
      create: {
        watchable_unit_id: created.id,
        color: "Silver",
        hardware,
        size,
        reference_code: unit.referenceCode,
        active: true,
      },
      update: {
        watchable_unit_id: created.id,
        color: "Silver",
        hardware,
        size,
        active: true,
      },
    });
  }

  console.log(`  Cartier: ${cartierUnits.length} units + SKUs`);
  console.log(
    `Done. Seeded ${hermesUnits.length + cartierUnits.length} watchable units.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
