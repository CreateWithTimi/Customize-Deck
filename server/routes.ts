import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { deckConfigSchema, REQUIRED_TOTAL, MAX_QUANTITY, DECK_PRICE, CURRENCY_CODE } from "@shared/schema";
import { z } from "zod";
import { initializeTransaction, verifyTransaction, generateReference, isPaystackConfigured } from "./paystackClient";
import { sendOrderEmails } from "./emailService";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Check if Paystack is configured
  app.get("/api/payment/config", async (_req, res) => {
    res.json({ 
      configured: isPaystackConfigured(),
      currency: CURRENCY_CODE,
      deckPrice: DECK_PRICE,
    });
  });

  // Create Paystack payment session
  app.post("/api/create-payment", async (req, res) => {
    try {
      if (!isPaystackConfigured()) {
        return res.status(503).json({ error: "Payment system not configured" });
      }

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
      const reference = generateReference();
      const callbackUrl = `${req.protocol}://${req.get('host')}/success?reference=${reference}`;

      const paystackResponse = await initializeTransaction({
        email: validated.shippingEmail,
        amount: totalAmount * 100, // Paystack uses kobo (smallest unit)
        reference,
        callback_url: callbackUrl,
        metadata: {
          deckConfig: validated.deckConfig,
          quantity: validated.quantity,
          shippingName: validated.shippingName,
          shippingEmail: validated.shippingEmail,
          shippingPhone: validated.shippingPhone || '',
          shippingAddress: validated.shippingAddress,
          shippingCity: validated.shippingCity,
          shippingState: validated.shippingState,
          shippingZip: validated.shippingZip,
          shippingCountry: validated.shippingCountry,
        },
      });

      return res.json({ 
        url: paystackResponse.data.authorization_url, 
        reference: paystackResponse.data.reference,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      console.error("Payment initialization error:", error);
      return res.status(500).json({ error: "Failed to initialize payment" });
    }
  });

  // Verify payment and create order
  app.post("/api/verify-payment", async (req, res) => {
    try {
      const { reference } = req.body;
      
      if (!reference) {
        return res.status(400).json({ error: "Payment reference required" });
      }

      // Check if order already exists for this reference
      const existingOrder = await storage.getOrderByReference(reference);
      if (existingOrder) {
        return res.json(existingOrder);
      }

      const verification = await verifyTransaction(reference);

      if (verification.data.status !== 'success') {
        return res.status(400).json({ error: "Payment not successful" });
      }

      const metadata = verification.data.metadata;
      const deckConfig = metadata.deckConfig;

      const order = await storage.createOrder({
        deckConfig,
        quantity: parseInt(metadata.quantity) || 1,
        totalAmount: verification.data.amount / 100, // Convert from kobo to naira
        shippingName: metadata.shippingName,
        shippingEmail: metadata.shippingEmail || verification.data.customer.email,
        shippingPhone: metadata.shippingPhone || null,
        shippingAddress: metadata.shippingAddress,
        shippingCity: metadata.shippingCity,
        shippingState: metadata.shippingState,
        shippingZip: metadata.shippingZip,
        shippingCountry: metadata.shippingCountry,
        paymentReference: reference,
        paymentProvider: 'paystack',
      });

      // Send confirmation emails (non-blocking)
      sendOrderEmails(order).catch(err => console.error('Email sending failed:', err));

      return res.status(201).json(order);
    } catch (error) {
      console.error("Payment verification error:", error);
      return res.status(500).json({ error: "Failed to verify payment" });
    }
  });

  // Create order endpoint (for testing without payment)
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
