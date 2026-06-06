import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const GITHUB_AI_BASE = "https://models.inference.ai.azure.com";
const GITHUB_AI_MODEL = "gpt-4o-mini";

async function callGrok(systemPrompt: string, userMessage: string): Promise<string> {
  const key = process.env.GITHUB_TOKEN;
  if (!key) throw new Error("GITHUB_TOKEN not set");

  const response = await fetch(`${GITHUB_AI_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: GITHUB_AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`GitHub AI error: ${err}`);
  }

  const data = (await response.json()) as { choices: { message: { content: string } }[] };
  return data.choices[0]?.message?.content ?? "{}";
}

async function getAllProducts() {
  return db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      price: productsTable.price,
      unit: productsTable.unit,
      categoryName: categoriesTable.name,
      categorySlug: categoriesTable.slug,
      inStock: productsTable.inStock,
      featured: productsTable.featured,
      description: productsTable.description,
      imageUrl: productsTable.imageUrl,
      stock: productsTable.stock,
      originalPrice: productsTable.originalPrice,
      deliveryTime: productsTable.deliveryTime,
    })
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.inStock, true));
}

function buildCatalog(products: Awaited<ReturnType<typeof getAllProducts>>) {
  return products
    .map((p) => `ID:${p.id}|${p.name}|${p.categoryName}|₹${p.price}|${p.unit}`)
    .join("\n");
}

function mapProduct(p: Awaited<ReturnType<typeof getAllProducts>>[number]) {
  return {
    id: p.id,
    name: p.name,
    price: Number(p.price),
    originalPrice: p.originalPrice != null ? Number(p.originalPrice) : null,
    unit: p.unit,
    categoryName: p.categoryName,
    categorySlug: p.categorySlug,
    inStock: p.inStock,
    featured: p.featured,
    description: p.description,
    imageUrl: p.imageUrl,
    stock: p.stock,
    deliveryTime: p.deliveryTime,
  };
}

const BASE_SYSTEM = `You are a smart AI shopping assistant for QuickMart, a 10-minute grocery delivery app in India.
You MUST ONLY suggest products that exist in the catalog below. Use their exact IDs.
Always respond with valid JSON only — no markdown, no extra text.

PRODUCT CATALOG (ID|Name|Category|Price|Unit):
`;

// POST /ai/emergency
router.post("/ai/emergency", async (req, res) => {
  try {
    const { situation } = req.body as { situation: string };
    if (!situation) return res.status(400).json({ error: "situation required" });

    const products = await getAllProducts();
    const catalog = buildCatalog(products);

    const raw = await callGrok(
      BASE_SYSTEM + catalog + `\n\nSelect 6-12 most relevant products for the user's emergency situation. Return JSON:
{"productIds": [1,2,3], "message": "Quick summary of what you picked and why", "tip": "One practical tip"}`,
      situation
    );

    const parsed = JSON.parse(raw) as { productIds: number[]; message: string; tip?: string };
    const selected = products.filter((p) => parsed.productIds.includes(p.id)).map(mapProduct);

    return res.json({ products: selected, message: parsed.message, tip: parsed.tip });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, "AI emergency error");
    return res.status(500).json({ error: msg });
  }
});

// POST /ai/recipe
router.post("/ai/recipe", async (req, res) => {
  try {
    const { recipe } = req.body as { recipe: string };
    if (!recipe) return res.status(400).json({ error: "recipe required" });

    const products = await getAllProducts();
    const catalog = buildCatalog(products);

    const raw = await callGrok(
      BASE_SYSTEM + catalog + `\n\nUser wants to cook the given dish. Select all available ingredients from the catalog. Also list ingredients NOT available in the catalog. Return JSON:
{"productIds": [1,2,3], "message": "Brief recipe intro", "missingIngredients": ["ingredient1","ingredient2"], "cookingTip": "One quick tip"}`,
      `Recipe: ${recipe}`
    );

    const parsed = JSON.parse(raw) as {
      productIds: number[];
      message: string;
      missingIngredients?: string[];
      cookingTip?: string;
    };
    const selected = products.filter((p) => parsed.productIds.includes(p.id)).map(mapProduct);
    const estimatedCost = selected.reduce((s, p) => s + p.price, 0);

    return res.json({
      products: selected,
      message: parsed.message,
      missingIngredients: parsed.missingIngredients ?? [],
      cookingTip: parsed.cookingTip,
      estimatedCost,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, "AI recipe error");
    return res.status(500).json({ error: msg });
  }
});

// POST /ai/budget
router.post("/ai/budget", async (req, res) => {
  try {
    const { budget } = req.body as { budget: number };
    if (!budget || isNaN(Number(budget))) return res.status(400).json({ error: "budget required" });

    const products = await getAllProducts();
    const catalog = buildCatalog(products);

    const raw = await callGrok(
      BASE_SYSTEM + catalog + `\n\nCreate the BEST grocery basket under the given budget in rupees. Prioritize variety, nutrition, and value. Include quantities. Ensure total stays under budget. Return JSON:
{"items": [{"id": 1, "qty": 2}, {"id": 5, "qty": 1}], "message": "Summary of basket", "estimatedTotal": 450, "savings": "What you saved"}`,
      `Budget: ₹${budget}`
    );

    const parsed = JSON.parse(raw) as {
      items: { id: number; qty: number }[];
      message: string;
      estimatedTotal: number;
      savings?: string;
    };

    const selected = parsed.items
      .map((item) => {
        const product = products.find((p) => p.id === item.id);
        if (!product) return null;
        return { ...mapProduct(product), quantity: item.qty };
      })
      .filter(Boolean);

    return res.json({
      products: selected,
      message: parsed.message,
      estimatedTotal: parsed.estimatedTotal,
      savings: parsed.savings,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, "AI budget error");
    return res.status(500).json({ error: msg });
  }
});

// POST /ai/student
router.post("/ai/student", async (req, res) => {
  try {
    const { preset } = req.body as { preset: string };
    if (!preset) return res.status(400).json({ error: "preset required" });

    const products = await getAllProducts();
    const catalog = buildCatalog(products);

    const raw = await callGrok(
      BASE_SYSTEM + catalog + `\n\nYou are helping a college student. Select the most relevant products from the catalog for the given preset. Keep it affordable and practical. Return JSON:
{"productIds": [1,2,3], "message": "Fun, relatable message for a student", "totalEstimate": 150}`,
      `Student preset: ${preset}`
    );

    const parsed = JSON.parse(raw) as { productIds: number[]; message: string; totalEstimate?: number };
    const selected = products.filter((p) => parsed.productIds.includes(p.id)).map(mapProduct);

    return res.json({ products: selected, message: parsed.message, totalEstimate: parsed.totalEstimate });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, "AI student error");
    return res.status(500).json({ error: msg });
  }
});

// POST /ai/health
router.post("/ai/health", async (req, res) => {
  try {
    const { goal } = req.body as { goal: string };
    if (!goal) return res.status(400).json({ error: "goal required" });

    const products = await getAllProducts();
    const catalog = buildCatalog(products);

    const raw = await callGrok(
      BASE_SYSTEM + catalog + `\n\nUser has a health/fitness goal. Select the most beneficial products from the catalog that support this goal. Focus on nutrition and health value. Return JSON:
{"productIds": [1,2,3], "message": "Motivational health message", "reasons": ["Reason 1", "Reason 2", "Reason 3"], "weeklyPlan": "Brief weekly usage suggestion"}`,
      `Health goal: ${goal}`
    );

    const parsed = JSON.parse(raw) as {
      productIds: number[];
      message: string;
      reasons?: string[];
      weeklyPlan?: string;
    };
    const selected = products.filter((p) => parsed.productIds.includes(p.id)).map(mapProduct);

    return res.json({
      products: selected,
      message: parsed.message,
      reasons: parsed.reasons ?? [],
      weeklyPlan: parsed.weeklyPlan,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, "AI health error");
    return res.status(500).json({ error: msg });
  }
});

// GET /ai/test — diagnostic: checks token + DB
router.get("/ai/test", async (req, res) => {
  const results: Record<string, string> = {};

  // Check token
  const key = process.env.GITHUB_TOKEN;
  if (!key) {
    results.token = "❌ GITHUB_TOKEN not set";
  } else {
    try {
      const r = await fetch(`${GITHUB_AI_BASE}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: GITHUB_AI_MODEL,
          messages: [{ role: "user", content: "Reply with valid json: {\"ok\": true}" }],
          response_format: { type: "json_object" },
          max_tokens: 20,
        }),
      });
      if (r.ok) {
        results.token = "✅ GitHub Models API working";
      } else {
        const err = await r.text();
        results.token = `❌ API error ${r.status}: ${err}`;
      }
    } catch (e) {
      results.token = `❌ Network error: ${e instanceof Error ? e.message : e}`;
    }
  }

  // Check DB
  try {
    const count = await getAllProducts();
    results.db = `✅ DB connected — ${count.length} products loaded`;
  } catch (e) {
    results.db = `❌ DB error: ${e instanceof Error ? e.message : e}`;
  }

  return res.json(results);
});

export default router;
