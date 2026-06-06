import { Router } from "express";
import { db } from "@workspace/db";
import { cartItemsTable, productsTable, categoriesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

const SESSION_ID = "default";
const DELIVERY_FEE = 29;
const FREE_DELIVERY_THRESHOLD = 199;

async function buildCart() {
  const items = await db
    .select({
      productId: cartItemsTable.productId,
      name: productsTable.name,
      price: productsTable.price,
      quantity: cartItemsTable.quantity,
      unit: productsTable.unit,
      imageUrl: productsTable.imageUrl,
    })
    .from(cartItemsTable)
    .innerJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.sessionId, SESSION_ID));

  const cartItems = items.map((i) => ({
    productId: i.productId,
    name: i.name,
    price: Number(i.price),
    quantity: i.quantity,
    unit: i.unit,
    imageUrl: i.imageUrl ?? null,
  }));

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;
  const itemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return { items: cartItems, subtotal, deliveryFee, total, itemCount };
}

router.get("/cart", async (req, res) => {
  try {
    return res.json(await buildCart());
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to get cart" });
  }
});

router.post("/cart/items", async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || !quantity) return res.status(400).json({ error: "productId and quantity required" });

    const existing = await db
      .select()
      .from(cartItemsTable)
      .where(and(eq(cartItemsTable.sessionId, SESSION_ID), eq(cartItemsTable.productId, productId)))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(cartItemsTable)
        .set({ quantity: existing[0].quantity + quantity })
        .where(eq(cartItemsTable.id, existing[0].id));
    } else {
      await db.insert(cartItemsTable).values({ sessionId: SESSION_ID, productId, quantity });
    }

    return res.json(await buildCart());
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to add to cart" });
  }
});

router.patch("/cart/items/:productId", async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const { quantity } = req.body;

    if (quantity <= 0) {
      await db
        .delete(cartItemsTable)
        .where(and(eq(cartItemsTable.sessionId, SESSION_ID), eq(cartItemsTable.productId, productId)));
    } else {
      await db
        .update(cartItemsTable)
        .set({ quantity })
        .where(and(eq(cartItemsTable.sessionId, SESSION_ID), eq(cartItemsTable.productId, productId)));
    }

    return res.json(await buildCart());
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to update cart item" });
  }
});

router.delete("/cart/items/:productId", async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    await db
      .delete(cartItemsTable)
      .where(and(eq(cartItemsTable.sessionId, SESSION_ID), eq(cartItemsTable.productId, productId)));
    return res.json(await buildCart());
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to remove from cart" });
  }
});

router.delete("/cart", async (req, res) => {
  try {
    await db.delete(cartItemsTable).where(eq(cartItemsTable.sessionId, SESSION_ID));
    return res.json(await buildCart());
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to clear cart" });
  }
});

export default router;
