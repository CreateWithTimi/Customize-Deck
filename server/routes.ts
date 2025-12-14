import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, deckConfigSchema, REQUIRED_TOTAL } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Create order endpoint
  app.post("/api/orders", async (req, res) => {
    try {
      // Validate request body
      const orderSchema = z.object({
        deckConfig: deckConfigSchema,
        shippingName: z.string().min(2),
        shippingEmail: z.string().email(),
        shippingAddress: z.string().min(5),
        shippingCity: z.string().min(2),
        shippingState: z.string().min(2),
        shippingZip: z.string().min(3),
        shippingCountry: z.string().min(2),
      });

      const validated = orderSchema.parse(req.body);

      // Validate deck config totals to 52
      if (validated.deckConfig.total !== REQUIRED_TOTAL) {
        return res.status(400).json({ 
          error: `Deck must have exactly ${REQUIRED_TOTAL} cards` 
        });
      }

      // Validate card back is selected
      if (!validated.deckConfig.cardBackDesign) {
        return res.status(400).json({ 
          error: "Card back design must be selected" 
        });
      }

      // Create the order
      const order = await storage.createOrder({
        deckConfig: validated.deckConfig,
        shippingName: validated.shippingName,
        shippingEmail: validated.shippingEmail,
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

  return httpServer;
}
