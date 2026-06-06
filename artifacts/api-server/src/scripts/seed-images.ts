/**
 * Image seeding script — run with:
 *   node --env-file=.env -r tsx/esm artifacts/api-server/src/scripts/seed-images.ts
 *
 * Maps product names (case-insensitive LIKE) to their local image paths served from /products/.
 * Runs UPDATE on each matched product in the DB.
 */

import { db } from "@workspace/db";
import { productsTable } from "@workspace/db";
import { ilike } from "drizzle-orm";

const IMAGE_MAP: { match: string; url: string }[] = [
  { match: "%maggi noodles%",          url: "/products/Maggi.jpg" },
  { match: "%maggi%cup%",              url: "/products/maggi cup noodles.jpg" },
  { match: "%quaker%oat%",             url: "/products/Quaker oats.jpg" },
  { match: "%amul%butter%",            url: "/products/amul butter.jpg" },
  { match: "%amul%ghee%",              url: "/products/amul ghee.jpg" },
  { match: "%apple%shimla%",           url: "/products/apples shimla.jpg" },
  { match: "%banana%",                 url: "/products/bananas.jpg" },
  { match: "%colgate%",                url: "/products/colgate max fresh.jpg" },
  { match: "%egg%",                    url: "/products/egg farm fresh.jpg" },
  { match: "%sunflower%oil%",          url: "/products/fortune sunflower oil.jpg" },
  { match: "%basmati%rice%",           url: "/products/india gate basmati rice.jpg" },
  { match: "%india gate%",             url: "/products/india gate basmati rice.jpg" },
  { match: "%kurkure%",                url: "/products/kurkure.jpg" },
  { match: "%mother dairy%paneer%",    url: "/products/mother dairy paneer.jpg" },
  { match: "%paneer%",                 url: "/products/mother dairy paneer.jpg" },
  { match: "%curd%",                   url: "/products/mother-curd.jpg" },
  { match: "%nescafe%",                url: "/products/nescafe classic coffee.jpg" },
  { match: "%coffee%",                 url: "/products/nescafe classic coffee.jpg" },
  { match: "%nivea%",                  url: "/products/nivea body lotion.jpg" },
  { match: "%onion%",                  url: "/products/onions.jpg" },
  { match: "%potato%",                 url: "/products/potatoes.jpg" },
  { match: "%tata%tea%",               url: "/products/tata tea premium.jpg" },
  { match: "%whiskas%",                url: "/products/whiskas cat food.jpg" },
  { match: "%cat food%",               url: "/products/whiskas cat food.jpg" },
];

async function seedImages() {
  console.log("🌱 Starting image seed...\n");
  let updated = 0;

  for (const { match, url } of IMAGE_MAP) {
    const result = await db
      .update(productsTable)
      .set({ imageUrl: url })
      .where(ilike(productsTable.name, match));

    const count = (result as unknown as { rowCount: number })?.rowCount ?? 0;
    if (count > 0) {
      console.log(`✅  ${count} product(s) updated → ${url}`);
      updated += count;
    } else {
      console.log(`⚠️  No match for pattern: ${match}`);
    }
  }

  console.log(`\n✨ Done! ${updated} products updated with real images.`);
  process.exit(0);
}

seedImages().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
