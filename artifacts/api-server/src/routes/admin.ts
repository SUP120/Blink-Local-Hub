import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, productsTable, categoriesTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";

const router = Router();

async function getOrderFull(orderId: number) {
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId)).limit(1);
  if (!order) return null;
  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, orderId));
  return {
    id: order.id,
    status: order.status,
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee),
    total: Number(order.total),
    deliveryAddress: order.deliveryAddress,
    paymentMethod: order.paymentMethod,
    estimatedDelivery: order.estimatedDelivery ?? null,
    createdAt: order.createdAt.toISOString(),
    items: items.map((i) => ({
      productId: i.productId,
      name: i.name,
      price: Number(i.price),
      quantity: i.quantity,
      unit: i.unit,
    })),
  };
}

// GET /admin/stats
router.get("/admin/stats", async (req, res) => {
  try {
    const [productCount, categoryCount, orderStats, revenueResult] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(productsTable),
      db.select({ count: sql<number>`count(*)::int` }).from(categoriesTable),
      db.select({
        total: sql<number>`count(*)::int`,
        confirmed: sql<number>`count(*) filter (where status = 'confirmed')::int`,
        processing: sql<number>`count(*) filter (where status = 'processing')::int`,
        onTheWay: sql<number>`count(*) filter (where status = 'on the way')::int`,
        delivered: sql<number>`count(*) filter (where status = 'delivered')::int`,
        cancelled: sql<number>`count(*) filter (where status = 'cancelled')::int`,
      }).from(ordersTable),
      db.select({ revenue: sql<number>`coalesce(sum(total), 0)::numeric` }).from(ordersTable).where(eq(ordersTable.status, "delivered")),
    ]);
    return res.json({
      products: productCount[0]?.count ?? 0,
      categories: categoryCount[0]?.count ?? 0,
      orders: orderStats[0] ?? { total: 0, confirmed: 0, processing: 0, onTheWay: 0, delivered: 0, cancelled: 0 },
      revenue: Number(revenueResult[0]?.revenue ?? 0),
    });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// GET /admin/orders
router.get("/admin/orders", async (req, res) => {
  try {
    const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(100);
    const full = await Promise.all(orders.map((o) => getOrderFull(o.id)));
    return res.json(full.filter(Boolean));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// PATCH /admin/orders/:id/status
router.patch("/admin/orders/:id/status", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body as { status: string };
    const allowed = ["confirmed", "processing", "on the way", "delivered", "cancelled"];
    if (!allowed.includes(status)) return res.status(400).json({ error: "Invalid status" });
    await db.update(ordersTable).set({ status }).where(eq(ordersTable.id, id));
    const order = await getOrderFull(id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    return res.json(order);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to update order" });
  }
});

// GET /admin/products
router.get("/admin/products", async (req, res) => {
  try {
    const products = await db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        categoryId: productsTable.categoryId,
        categoryName: categoriesTable.name,
        categorySlug: categoriesTable.slug,
        price: productsTable.price,
        originalPrice: productsTable.originalPrice,
        stock: productsTable.stock,
        unit: productsTable.unit,
        deliveryTime: productsTable.deliveryTime,
        inStock: productsTable.inStock,
        featured: productsTable.featured,
        description: productsTable.description,
        imageUrl: productsTable.imageUrl,
      })
      .from(productsTable)
      .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .orderBy(categoriesTable.name, productsTable.name);

    return res.json(
      products.map((p) => ({
        ...p,
        price: Number(p.price),
        originalPrice: p.originalPrice != null ? Number(p.originalPrice) : null,
      }))
    );
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch products" });
  }
});

// POST /admin/products
router.post("/admin/products", async (req, res) => {
  try {
    const { name, categoryId, price, originalPrice, stock, unit, inStock, featured, description, imageUrl, deliveryTime } = req.body;
    if (!name || !categoryId || !price) return res.status(400).json({ error: "name, categoryId, price required" });

    const [product] = await db
      .insert(productsTable)
      .values({
        name,
        categoryId: Number(categoryId),
        price: String(price),
        originalPrice: originalPrice ? String(originalPrice) : null,
        stock: stock ? Number(stock) : 100,
        unit: unit || "1 pc",
        deliveryTime: deliveryTime || "10 mins",
        inStock: inStock !== false,
        featured: !!featured,
        description: description || null,
        imageUrl: imageUrl || null,
      })
      .returning();

    return res.status(201).json({ ...product, price: Number(product.price) });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to add product" });
  }
});

// PATCH /admin/products/:id
router.patch("/admin/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, price, originalPrice, stock, inStock, featured, description, imageUrl, unit, deliveryTime } = req.body;
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (price !== undefined) updates.price = String(price);
    if (originalPrice !== undefined) updates.originalPrice = originalPrice ? String(originalPrice) : null;
    if (stock !== undefined) updates.stock = Number(stock);
    if (inStock !== undefined) updates.inStock = !!inStock;
    if (featured !== undefined) updates.featured = !!featured;
    if (description !== undefined) updates.description = description;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;
    if (unit !== undefined) updates.unit = unit;
    if (deliveryTime !== undefined) updates.deliveryTime = deliveryTime;

    await db.update(productsTable).set(updates).where(eq(productsTable.id, id));
    const [p] = await db.select().from(productsTable).where(eq(productsTable.id, id));
    return res.json({ ...p, price: Number(p.price) });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE /admin/products/:id
router.delete("/admin/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(productsTable).where(eq(productsTable.id, id));
    return res.json({ success: true });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
