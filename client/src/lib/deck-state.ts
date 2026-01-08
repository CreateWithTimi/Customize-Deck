import { DeckConfig, CATEGORIES, REQUIRED_TOTAL, Category, CATEGORY_META, CARD_BACK_DESIGNS, DECK_PRICE, formatPrice } from "@shared/schema";

const STORAGE_KEY = "deckConfigV1";

// Get default empty config
function getDefaultConfig(): DeckConfig {
  return {
    counts: {
      romantic: 0,
      deep: 0,
      naughty: 0,
      friendship: 0,
      playful: 0,
    },
    total: 0,
    cardBackDesign: null,
    cardBackIndex: null,
    cardBackHue: 0,
  };
}

// Sanitize raw localStorage data
function sanitizeDeckConfig(raw: unknown): DeckConfig {
  const config = getDefaultConfig();

  if (!raw || typeof raw !== "object") {
    return config;
  }

  const rawObj = raw as Record<string, unknown>;

  // Ensure all categories exist with valid values
  if (rawObj.counts && typeof rawObj.counts === "object") {
    const rawCounts = rawObj.counts as Record<string, unknown>;
    CATEGORIES.forEach((cat) => {
      const value = parseInt(String(rawCounts[cat])) || 0;
      config.counts[cat] = Math.max(0, Math.min(REQUIRED_TOTAL, value));
    });
  }

  // Recalculate total (don't trust stored value)
  config.total = Object.values(config.counts).reduce((sum, n) => sum + n, 0);

  // Validate card back selection
  if (typeof rawObj.cardBackDesign === "string" && rawObj.cardBackDesign.length > 0) {
    config.cardBackDesign = rawObj.cardBackDesign;
    config.cardBackIndex = parseInt(String(rawObj.cardBackIndex)) || 0;
    config.cardBackHue = Math.max(0, Math.min(360, parseInt(String(rawObj.cardBackHue)) || 0));
  }

  return config;
}

// Get state from localStorage
export function getDeckState(): DeckConfig {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return sanitizeDeckConfig(raw);
  } catch (err) {
    console.error("[State] Parse error, using defaults:", err);
    return sanitizeDeckConfig({});
  }
}

// Set state to localStorage
export function setDeckState(updates: Partial<DeckConfig>): DeckConfig {
  const current = getDeckState();
  const updated = { ...current, ...updates };

  // Recalculate total
  updated.total = Object.values(updated.counts).reduce((sum, n) => sum + n, 0);

  // Invalidate card back if total changed and no longer 52
  if (updated.total !== REQUIRED_TOTAL) {
    updated.cardBackDesign = null;
    updated.cardBackIndex = null;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

// Update a single category count
export function updateCategoryCount(category: Category, delta: number): DeckConfig | null {
  const state = getDeckState();
  const newValue = (state.counts[category] || 0) + delta;

  // Prevent negative values
  if (newValue < 0) {
    return null;
  }

  // Prevent total exceeding 52
  const newTotal = state.total - state.counts[category] + newValue;
  if (newTotal > REQUIRED_TOTAL) {
    return null;
  }

  state.counts[category] = newValue;
  return setDeckState({ counts: state.counts });
}

// Set a specific category count
export function setCategoryCount(category: Category, value: number): DeckConfig | null {
  const state = getDeckState();
  const clampedValue = Math.max(0, Math.min(REQUIRED_TOTAL, value));

  // Check if new total would exceed 52
  const otherTotal = state.total - state.counts[category];
  if (otherTotal + clampedValue > REQUIRED_TOTAL) {
    return null;
  }

  state.counts[category] = clampedValue;
  return setDeckState({ counts: state.counts });
}

// Set card back selection
export function setCardBack(designId: string, index: number, hue: number = 0): DeckConfig {
  return setDeckState({
    cardBackDesign: designId,
    cardBackIndex: index,
    cardBackHue: Math.max(0, Math.min(360, hue)),
  });
}

// Clear all state
export function clearDeckState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Validation helpers
export const validations = {
  canProceedToCardBack(config: DeckConfig): boolean {
    return config.total === REQUIRED_TOTAL;
  },

  canProceedToPreview(config: DeckConfig): boolean {
    return config.total === REQUIRED_TOTAL && config.cardBackDesign !== null;
  },

  canProceedToCheckout(config: DeckConfig): boolean {
    return this.canProceedToPreview(config);
  },

  isComplete(config: DeckConfig): boolean {
    return config.total === REQUIRED_TOTAL;
  },

  getValidationErrors(config: DeckConfig): string[] {
    const errors: string[] = [];
    
    if (config.total === 0) {
      errors.push("Please select at least one category for your deck");
    } else if (config.total !== REQUIRED_TOTAL) {
      errors.push(`Your deck needs exactly ${REQUIRED_TOTAL} cards (currently ${config.total})`);
    }
    
    if (!config.cardBackDesign) {
      errors.push("Please select a card back design");
    }
    
    return errors;
  },
};

// Deck summary for orders (reusable for WhatsApp beta and future Paystack checkout)
export interface DeckSummary {
  deckId: string;
  categories: Array<{ name: string; count: number }>;
  totalCards: number;
  cardBackDesign: string;
  cardBackHue: number | null;
  price: number;
  formattedPrice: string;
  estimatedDelivery: string;
  createdAt: string;
}

export function generateDeckSummary(config: DeckConfig): DeckSummary | null {
  // Validate deck is complete
  if (validations.getValidationErrors(config).length > 0) {
    return null;
  }

  // Generate unique deck ID
  const deckId = `DECK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  // Build category breakdown
  const categories = CATEGORIES
    .filter((cat) => config.counts[cat] > 0)
    .map((cat) => ({
      name: CATEGORY_META[cat].label,
      count: config.counts[cat],
    }));

  // Get card back design name
  const design = CARD_BACK_DESIGNS.find((d) => d.id === config.cardBackDesign);
  const cardBackDesign = design?.name || config.cardBackDesign || "Unknown";

  // Estimated delivery (5-7 business days from now)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 7);
  const estimatedDelivery = `5-7 business days (by ${deliveryDate.toLocaleDateString("en-NG", { 
    weekday: "short", 
    month: "short", 
    day: "numeric" 
  })})`;

  return {
    deckId,
    categories,
    totalCards: config.total,
    cardBackDesign,
    cardBackHue: config.cardBackDesign === "custom-gradient" ? config.cardBackHue : null,
    price: DECK_PRICE,
    formattedPrice: formatPrice(DECK_PRICE),
    estimatedDelivery,
    createdAt: new Date().toISOString(),
  };
}

// Generate WhatsApp message from deck summary
export function generateWhatsAppMessage(summary: DeckSummary): string {
  const categoryList = summary.categories
    .map((c) => `  - ${c.name}: ${c.count} cards`)
    .join("\n");

  const hueInfo = summary.cardBackHue !== null 
    ? ` (Hue: ${summary.cardBackHue})` 
    : "";

  return `Hi! I'd like to place a beta order for a custom conversation deck.

*Deck ID:* ${summary.deckId}

*My Card Mix:*
${categoryList}

*Total Cards:* ${summary.totalCards}
*Card Back:* ${summary.cardBackDesign}${hueInfo}
*Price:* ${summary.formattedPrice}
*Estimated Delivery:* ${summary.estimatedDelivery}

Please guide me through the next steps for payment and delivery. Thank you!`;
}

// Generate WhatsApp URL
export function generateWhatsAppUrl(phoneNumber: string, message: string): string {
  // Remove any non-digit characters and ensure country code
  let cleanNumber = phoneNumber.replace(/\D/g, "");
  
  // Add Nigeria country code if not present
  if (cleanNumber.startsWith("0")) {
    cleanNumber = "234" + cleanNumber.substring(1);
  } else if (!cleanNumber.startsWith("234")) {
    cleanNumber = "234" + cleanNumber;
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}
