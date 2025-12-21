import { DeckConfig, CATEGORIES, REQUIRED_TOTAL, Category, CardBackColors } from "@shared/schema";

const STORAGE_KEY = "deckConfigV1";

const DEFAULT_CARD_BACK_COLORS: CardBackColors = {
  colorUp: "#8B5CF6",
  colorDown: "#EC4899",
  backgroundColor: "#1F1F2E",
};

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
    cardBackColors: null,
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
    
    // Validate card back colors for Rive designs
    if (rawObj.cardBackColors && typeof rawObj.cardBackColors === "object") {
      const rawColors = rawObj.cardBackColors as Record<string, unknown>;
      config.cardBackColors = {
        colorUp: typeof rawColors.colorUp === "string" ? rawColors.colorUp : DEFAULT_CARD_BACK_COLORS.colorUp,
        colorDown: typeof rawColors.colorDown === "string" ? rawColors.colorDown : DEFAULT_CARD_BACK_COLORS.colorDown,
        backgroundColor: typeof rawColors.backgroundColor === "string" ? rawColors.backgroundColor : DEFAULT_CARD_BACK_COLORS.backgroundColor,
      };
    }
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
export function setCardBack(designId: string, index: number, hue: number = 0, colors?: CardBackColors): DeckConfig {
  return setDeckState({
    cardBackDesign: designId,
    cardBackIndex: index,
    cardBackHue: Math.max(0, Math.min(360, hue)),
    cardBackColors: colors || null,
  });
}

// Set card back colors for Rive designs
export function setCardBackColors(colors: CardBackColors): DeckConfig {
  const state = getDeckState();
  return setDeckState({
    cardBackColors: colors,
  });
}

// Get default card back colors
export function getDefaultCardBackColors(): CardBackColors {
  return { ...DEFAULT_CARD_BACK_COLORS };
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
};
