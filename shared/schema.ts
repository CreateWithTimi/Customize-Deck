import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Categories for the conversation deck
export const CATEGORIES = ["romantic", "deep", "naughty", "friendship", "playful"] as const;
export type Category = typeof CATEGORIES[number];

export const REQUIRED_TOTAL = 52;

// Category metadata
export const CATEGORY_META: Record<Category, { label: string; description: string; color: string; icon: string }> = {
  romantic: {
    label: "Romantic",
    description: "Questions that spark love and connection",
    color: "rose",
    icon: "Heart"
  },
  deep: {
    label: "Deep",
    description: "Thought-provoking questions for meaningful conversations",
    color: "indigo",
    icon: "Brain"
  },
  naughty: {
    label: "Naughty",
    description: "Playful and flirty questions to heat things up",
    color: "orange",
    icon: "Flame"
  },
  friendship: {
    label: "Friendship",
    description: "Questions to strengthen your bond",
    color: "emerald",
    icon: "Users"
  },
  playful: {
    label: "Playful",
    description: "Fun and lighthearted questions",
    color: "violet",
    icon: "Sparkles"
  }
};

// Card back designs
export const CARD_BACK_DESIGNS = [
  { id: "midnight-noir", name: "Midnight Noir", description: "Elegant black with gold foil accents", type: "static" as const },
  { id: "rose-garden", name: "Rose Garden", description: "Romantic blush pink with floral patterns", type: "static" as const },
  { id: "celestial", name: "Celestial", description: "Deep blue with constellation patterns", type: "static" as const },
  { id: "classic-marble", name: "Classic Marble", description: "Timeless white marble with gold veins", type: "static" as const },
  { id: "passion-red", name: "Passion Red", description: "Bold crimson with subtle heart motifs", type: "static" as const },
  { id: "origin", name: "Origin", description: "Custom animated design with full color control", type: "rive" as const, riveAssetId: "originCardBack" },
] as const;

export type CardBackDesign = typeof CARD_BACK_DESIGNS[number];

// Card back colors schema for Rive-based designs
export const cardBackColorsSchema = z.object({
  colorUp: z.string().default("#8B5CF6"),
  colorDown: z.string().default("#EC4899"),
  backgroundColor: z.string().default("#1F1F2E"),
});

export type CardBackColors = z.infer<typeof cardBackColorsSchema>;

// Deck configuration schema
export const deckConfigSchema = z.object({
  counts: z.object({
    romantic: z.number().min(0).max(REQUIRED_TOTAL),
    deep: z.number().min(0).max(REQUIRED_TOTAL),
    naughty: z.number().min(0).max(REQUIRED_TOTAL),
    friendship: z.number().min(0).max(REQUIRED_TOTAL),
    playful: z.number().min(0).max(REQUIRED_TOTAL),
  }),
  total: z.number(),
  cardBackDesign: z.string().nullable(),
  cardBackIndex: z.number().nullable(),
  cardBackHue: z.number().min(0).max(360).default(0),
  cardBackColors: cardBackColorsSchema.nullable().default(null),
});

export type DeckConfig = z.infer<typeof deckConfigSchema>;

// Pricing
export const DECK_PRICE = 29.99;
export const MAX_QUANTITY = 10;

// Order schema
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deckConfig: jsonb("deck_config").notNull(),
  quantity: integer("quantity").notNull().default(1),
  shippingName: text("shipping_name").notNull(),
  shippingEmail: text("shipping_email").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  shippingCity: text("shipping_city").notNull(),
  shippingState: text("shipping_state").notNull(),
  shippingZip: text("shipping_zip").notNull(),
  shippingCountry: text("shipping_country").notNull(),
  status: text("status").notNull().default("pending"),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  status: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Shipping form schema
export const shippingFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State is required"),
  zip: z.string().min(3, "ZIP code is required"),
  country: z.string().min(2, "Country is required"),
});

export type ShippingForm = z.infer<typeof shippingFormSchema>;

// Step definitions for the wizard
export const STEPS = [
  { id: 0, name: "Build Deck", path: "/customize" },
  { id: 1, name: "Card Back", path: "/card-back" },
  { id: 2, name: "Preview", path: "/preview" },
  { id: 3, name: "Checkout", path: "/checkout" },
  { id: 4, name: "Done", path: "/success" },
] as const;

export type Step = typeof STEPS[number];
