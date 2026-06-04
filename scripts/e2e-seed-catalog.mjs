/**
 * Seeds Hermès catalog reference data (watchable_units + skus) into the
 * deployed Supabase project via the REST API. Idempotent — uses the same
 * deterministic (brand, product_line, model_name) and (watchable_unit_id,
 * color, leather, hardware, size) tuples on each run, and skips inserts
 * when matching rows already exist.
 *
 * Sister script to scripts/e2e-seed.mjs (which only upserts the e2e
 * auth_users row). Catalog seeding lives in its own script because:
 *   - it only needs to run once per environment (catalog is reference data)
 *   - failures shouldn't gate the unauthenticated Maestro sweep
 *
 * Required env (use op:// references — never hardcode):
 *   E2E_SUPABASE_URL
 *   E2E_SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage (one-shot):
 *   E2E_SUPABASE_URL=op://Openclaw/supabase.stock-tracker-develop/url \
 *   E2E_SUPABASE_SERVICE_ROLE_KEY=op://Openclaw/supabase.stock-tracker-develop/service_role_key \
 *   op run -- node scripts/e2e-seed-catalog.mjs
 *
 * Why REST and not Prisma: the develop pooler credentials are stale
 * (tracked in the parent INF-1551). Once pooler access is restored,
 * packages/prisma/prisma/seed-dev.ts is the canonical fuller seed.
 */

const SUPABASE_URL = process.env.E2E_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.E2E_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing required env vars: E2E_SUPABASE_URL, E2E_SUPABASE_SERVICE_ROLE_KEY",
  );
  process.exit(1);
}

const headers = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

const rest = (path) => `${SUPABASE_URL}/rest/v1${path}`;

async function restFetch(path, init = {}) {
  const res = await fetch(rest(path), { headers, ...init });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(
      `REST ${init.method ?? "GET"} ${path} failed (${res.status}): ${text}`,
    );
  }
  return text ? JSON.parse(text) : null;
}

async function findUnit(brand, productLine, modelName) {
  const q = new URLSearchParams({
    brand: `eq.${brand}`,
    product_line: `eq.${productLine}`,
    model_name: `eq.${modelName}`,
    select: "id",
  });
  const rows = await restFetch(`/watchable_units?${q}`);
  return rows[0]?.id ?? null;
}

async function ensureUnit(brand, productLine, modelName) {
  const existing = await findUnit(brand, productLine, modelName);
  if (existing) return existing;
  const now = new Date().toISOString();
  const [row] = await restFetch("/watchable_units", {
    method: "POST",
    body: JSON.stringify({
      brand,
      product_line: productLine,
      model_name: modelName,
      updated_at: now,
    }),
  });
  return row.id;
}

async function findSku(unitId, color, leather, hardware, size) {
  const q = new URLSearchParams({
    watchable_unit_id: `eq.${unitId}`,
    color: `eq.${color}`,
    select: "id",
  });
  if (leather) q.append("leather", `eq.${leather}`);
  if (hardware) q.append("hardware", `eq.${hardware}`);
  if (size) q.append("size", `eq.${size}`);
  const rows = await restFetch(`/skus?${q}`);
  return rows[0]?.id ?? null;
}

async function ensureSku(unitId, color, leather, hardware, size) {
  const existing = await findSku(unitId, color, leather, hardware, size);
  if (existing) return existing;
  const now = new Date().toISOString();
  const [row] = await restFetch("/skus", {
    method: "POST",
    body: JSON.stringify({
      watchable_unit_id: unitId,
      color,
      leather,
      hardware,
      size,
      updated_at: now,
    }),
  });
  return row.id;
}

const CATALOG = [
  {
    brand: "Hermes",
    productLine: "Birkin",
    units: [
      {
        modelName: "Birkin 25",
        skus: [
          { color: "Noir", leather: "Togo", hardware: "GHW", size: "25" },
          { color: "Etoupe", leather: "Togo", hardware: "PHW", size: "25" },
          { color: "Gold", leather: "Epsom", hardware: "GHW", size: "25" },
        ],
      },
      {
        modelName: "Birkin 30",
        skus: [
          { color: "Noir", leather: "Togo", hardware: "GHW", size: "30" },
          { color: "Etoupe", leather: "Swift", hardware: "PHW", size: "30" },
        ],
      },
    ],
  },
  {
    brand: "Hermes",
    productLine: "Kelly",
    units: [
      {
        modelName: "Kelly 28 Sellier",
        skus: [
          { color: "Noir", leather: "Epsom", hardware: "GHW", size: "28" },
          { color: "Rouge H", leather: "Togo", hardware: "GHW", size: "28" },
        ],
      },
      {
        modelName: "Kelly 32 Retourne",
        skus: [
          { color: "Etoupe", leather: "Togo", hardware: "RHW", size: "32" },
        ],
      },
    ],
  },
  {
    brand: "Hermes",
    productLine: "Lindy",
    units: [
      {
        modelName: "Lindy 26",
        skus: [
          { color: "Etoupe", leather: "Swift", hardware: "PHW", size: "26" },
        ],
      },
    ],
  },
];

let unitsCreated = 0;
let skusCreated = 0;

for (const group of CATALOG) {
  for (const unit of group.units) {
    const had = await findUnit(group.brand, group.productLine, unit.modelName);
    const unitId = await ensureUnit(
      group.brand,
      group.productLine,
      unit.modelName,
    );
    if (!had) unitsCreated++;
    for (const sku of unit.skus) {
      const skuHad = await findSku(
        unitId,
        sku.color,
        sku.leather,
        sku.hardware,
        sku.size,
      );
      await ensureSku(unitId, sku.color, sku.leather, sku.hardware, sku.size);
      if (!skuHad) skusCreated++;
    }
  }
}

const totals = await restFetch(
  "/watchable_units?select=id&active=eq.true",
).then((r) => r.length);
const skuTotal = await restFetch("/skus?select=id&active=eq.true").then(
  (r) => r.length,
);

console.log(
  `Done. Created ${unitsCreated} new watchable_units and ${skusCreated} new skus.`,
);
console.log(`Catalog totals: ${totals} active units, ${skuTotal} active skus.`);
