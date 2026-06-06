import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable } from "@workspace/db";
import { eq, ilike, and, sql } from "drizzle-orm";

const router = Router();

function mapProduct(p: typeof productsTable.$inferSelect & { categoryName: string; categorySlug: string }) {
  return {
    id: p.id,
    name: p.name,
    categoryId: p.categoryId,
    categorySlug: p.categorySlug,
    categoryName: p.categoryName,
    price: Number(p.price),
    originalPrice: p.originalPrice != null ? Number(p.originalPrice) : null,
    stock: p.stock,
    unit: p.unit,
    deliveryTime: p.deliveryTime,
    inStock: p.inStock,
    featured: p.featured,
    description: p.description ?? null,
    imageUrl: p.imageUrl ?? null,
  };
}

const productWithCategory = {
  id: productsTable.id,
  name: productsTable.name,
  categoryId: productsTable.categoryId,
  categorySlug: categoriesTable.slug,
  categoryName: categoriesTable.name,
  price: productsTable.price,
  originalPrice: productsTable.originalPrice,
  stock: productsTable.stock,
  unit: productsTable.unit,
  deliveryTime: productsTable.deliveryTime,
  inStock: productsTable.inStock,
  featured: productsTable.featured,
  description: productsTable.description,
  imageUrl: productsTable.imageUrl,
};

router.get("/products", async (req, res) => {
  try {
    const { category, search, limit = "50", offset = "0" } = req.query as Record<string, string>;

    const conditions = [];
    if (category) conditions.push(eq(categoriesTable.slug, category));
    if (search) conditions.push(ilike(productsTable.name, `%${search}%`));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [products, countResult] = await Promise.all([
      db
        .select(productWithCategory)
        .from(productsTable)
        .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
        .where(where)
        .limit(Number(limit))
        .offset(Number(offset)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(productsTable)
        .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
        .where(where),
    ]);

    return res.json({
      products: products.map(mapProduct),
      total: countResult[0]?.count ?? 0,
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/products/featured", async (req, res) => {
  try {
    const products = await db
      .select(productWithCategory)
      .from(productsTable)
      .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.featured, true))
      .limit(20);

    return res.json(products.map(mapProduct));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch featured products" });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [product] = await db
      .select(productWithCategory)
      .from(productsTable)
      .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.id, id))
      .limit(1);

    if (!product) return res.status(404).json({ error: "Product not found" });
    return res.json(mapProduct(product));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch product" });
  }
});

router.get("/stats/summary", async (req, res) => {
  try {
    const [productCount, categoryCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(productsTable),
      db.select({ count: sql<number>`count(*)::int` }).from(categoriesTable),
    ]);

    return res.json({
      totalProducts: productCount[0]?.count ?? 0,
      totalCategories: categoryCount[0]?.count ?? 0,
      avgDeliveryTime: "10 mins",
      minOrderValue: 0,
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch summary" });
  }
});

export default router;
