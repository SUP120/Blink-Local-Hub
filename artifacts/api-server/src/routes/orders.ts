import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, cartItemsTable, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const SESSION_ID = "default";
const DELIVERY_FEE = 29;
const FREE_DELIVERY_THRESHOLD = 199;

async function getOrderWithItems(orderId: number) {
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId)).limit(1);
  if (!order) return null;

  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, orderId));

  return {
    id: order.id,
    status: order.status,
    items: items.map((i) => ({
      productId: i.productId,
      name: i.name,
      price: Number(i.price),
      quantity: i.quantity,
      unit: i.unit,
    })),
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee),
    total: Number(order.total),
    deliveryAddress: order.deliveryAddress,
    estimatedDelivery: order.estimatedDelivery ?? null,
    createdAt: order.createdAt.toISOString(),
  };
}

router.get("/orders", async (req, res) => {
  try {
    const orders = await db.select().from(ordersTable).orderBy(ordersTable.createdAt);
    const result = await Promise.all(orders.map((o) => getOrderWithItems(o.id)));
    return res.json(result.filter(Boolean).reverse());
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.post("/orders", async (req, res) => {
  try {
    const { deliveryAddress, paymentMethod = "Cash on Delivery" } = req.body;
    if (!deliveryAddress) return res.status(400).json({ error: "Delivery address required" });

    // Get cart items
    const cartItems = await db
      .select({
        productId: cartItemsTable.productId,
        quantity: cartItemsTable.quantity,
        name: productsTable.name,
        price: productsTable.price,
        unit: productsTable.unit,
      })
      .from(cartItemsTable)
      .innerJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
      .where(eq(cartItemsTable.sessionId, SESSION_ID));

    if (cartItems.length === 0) return res.status(400).json({ error: "Cart is empty" });

    const subtotal = cartItems.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
    const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
    const total = subtotal + deliveryFee;

    // Create order
    const [order] = await db
      .insert(ordersTable)
      .values({
        status: "confirmed",
        subtotal: subtotal.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        total: total.toFixed(2),
        deliveryAddress,
        paymentMethod,
        estimatedDelivery: "10 minutes",
      })
      .returning();

    // Insert order items
    await db.insert(orderItemsTable).values(
      cartItems.map((i) => ({
        orderId: order.id,
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        unit: i.unit,
      }))
    );

    // Clear cart
    await db.delete(cartItemsTable).where(eq(cartItemsTable.sessionId, SESSION_ID));

    const result = await getOrderWithItems(order.id);
    return res.status(201).json(result);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to create order" });
  }
});

router.get("/orders/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const order = await getOrderWithItems(id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    return res.json(order);
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Failed to fetch order" });
  }
});

export default router;
