import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, deckConfigSchema, REQUIRED_TOTAL, MAX_QUANTITY, DECK_PRICE, CURRENCY_CODE } from "@shared/schema";
import { z } from "zod";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Get Stripe publishable key for frontend
  app.get("/api/stripe/config", async (_req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      console.error("Failed to get Stripe config:", error);
      res.status(500).json({ error: "Failed to get Stripe configuration" });
    }
  });

  // Create Stripe checkout session for one-time payment
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const sessionSchema = z.object({
        deckConfig: deckConfigSchema,
        quantity: z.number().int().min(1).max(MAX_QUANTITY),
        shippingName: z.string().min(2),
        shippingEmail: z.string().email(),
        shippingPhone: z.string().optional(),
        shippingAddress: z.string().min(5),
        shippingCity: z.string().min(2),
        shippingState: z.string().min(2),
        shippingZip: z.string().min(3),
        shippingCountry: z.string().min(2),
      });

      const validated = sessionSchema.parse(req.body);

      if (validated.deckConfig.total !== REQUIRED_TOTAL) {
        return res.status(400).json({ 
          error: `Deck must have exactly ${REQUIRED_TOTAL} cards` 
        });
      }

      if (!validated.deckConfig.cardBackDesign) {
        return res.status(400).json({ 
          error: "Card back design must be selected" 
        });
      }

      const totalAmount = DECK_PRICE * validated.quantity;
      const stripe = await getUncachableStripeClient();

      // Create checkout session with one-time payment
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [{
          price_data: {
            currency: CURRENCY_CODE.toLowerCase(),
            product_data: {
              name: 'Custom Conversation Deck',
              description: `${REQUIRED_TOTAL} cards with ${validated.deckConfig.cardBackDesign} design`,
            },
            unit_amount: DECK_PRICE * 100, // Stripe uses smallest currency unit (kobo for NGN)
          },
          quantity: validated.quantity,
        }],
        customer_email: validated.shippingEmail,
        metadata: {
          deckConfig: JSON.stringify(validated.deckConfig),
          quantity: validated.quantity.toString(),
          shippingName: validated.shippingName,
          shippingEmail: validated.shippingEmail,
          shippingPhone: validated.shippingPhone || '',
          shippingAddress: validated.shippingAddress,
          shippingCity: validated.shippingCity,
          shippingState: validated.shippingState,
          shippingZip: validated.shippingZip,
          shippingCountry: validated.shippingCountry,
        },
        success_url: `${req.protocol}://${req.get('host')}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get('host')}/checkout`,
      });

      return res.json({ url: session.url, sessionId: session.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      console.error("Checkout session error:", error);
      return res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // Handle successful payment - create order from session
  app.post("/api/orders/from-session", async (req, res) => {
    try {
      const { sessionId } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID required" });
      }

      const stripe = await getUncachableStripeClient();
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== 'paid') {
        return res.status(400).json({ error: "Payment not completed" });
      }

      // Check if order already exists for this session
      const existingOrder = await storage.getOrderBySessionId(sessionId);
      if (existingOrder) {
        return res.json(existingOrder);
      }

      const metadata = session.metadata!;
      const deckConfig = JSON.parse(metadata.deckConfig);

      const order = await storage.createOrder({
        deckConfig,
        quantity: parseInt(metadata.quantity),
        totalAmount: session.amount_total! / 100,
        shippingName: metadata.shippingName,
        shippingEmail: metadata.shippingEmail,
        shippingPhone: metadata.shippingPhone || null,
        shippingAddress: metadata.shippingAddress,
        shippingCity: metadata.shippingCity,
        shippingState: metadata.shippingState,
        shippingZip: metadata.shippingZip,
        shippingCountry: metadata.shippingCountry,
        stripeSessionId: sessionId,
        stripePaymentIntentId: session.payment_intent as string,
      });

      return res.status(201).json(order);
    } catch (error) {
      console.error("Order from session error:", error);
      return res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Create order endpoint (for testing without Stripe)
  app.post("/api/orders", async (req, res) => {
    try {
      const orderSchema = z.object({
        deckConfig: deckConfigSchema,
        quantity: z.number().int().min(1).max(MAX_QUANTITY),
        totalAmount: z.number().min(0),
        shippingName: z.string().min(2),
        shippingEmail: z.string().email(),
        shippingPhone: z.string().optional(),
        shippingAddress: z.string().min(5),
        shippingCity: z.string().min(2),
        shippingState: z.string().min(2),
        shippingZip: z.string().min(3),
        shippingCountry: z.string().min(2),
      });

      const validated = orderSchema.parse(req.body);

      if (validated.deckConfig.total !== REQUIRED_TOTAL) {
        return res.status(400).json({ 
          error: `Deck must have exactly ${REQUIRED_TOTAL} cards` 
        });
      }

      if (!validated.deckConfig.cardBackDesign) {
        return res.status(400).json({ 
          error: "Card back design must be selected" 
        });
      }

      const order = await storage.createOrder({
        deckConfig: validated.deckConfig,
        quantity: validated.quantity,
        totalAmount: validated.totalAmount,
        shippingName: validated.shippingName,
        shippingEmail: validated.shippingEmail,
        shippingPhone: validated.shippingPhone || null,
        shippingAddress: validated.shippingAddress,
        shippingCity: validated.shippingCity,
        shippingState: validated.shippingState,
        shippingZip: validated.shippingZip,
        shippingCountry: validated.shippingCountry,
      });

      return res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      console.error("Order creation error:", error);
      return res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Get order by ID
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      return res.json(order);
    } catch (error) {
      console.error("Get order error:", error);
      return res.status(500).json({ error: "Failed to get order" });
    }
  });

  // Get all orders (admin)
  app.get("/api/admin/orders", async (_req, res) => {
    try {
      const orders = await storage.getAllOrders();
      return res.json(orders);
    } catch (error) {
      console.error("Get orders error:", error);
      return res.status(500).json({ error: "Failed to get orders" });
    }
  });

  // Update order status (admin)
  app.patch("/api/admin/orders/:id/status", async (req, res) => {
    try {
      const { status, notes } = req.body;
      
      const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const order = await storage.updateOrderStatus(req.params.id, status, notes);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      return res.json(order);
    } catch (error) {
      console.error("Update order status error:", error);
      return res.status(500).json({ error: "Failed to update order status" });
    }
  });

  return httpServer;
}
