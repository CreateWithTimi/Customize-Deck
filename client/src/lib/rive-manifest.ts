/**
 * Rive Asset Manifest
 * 
 * This file defines all Rive animations used in the application.
 * It serves as the single source of truth for:
 * - Asset paths
 * - Artboard names
 * - State machine names
 * - Expected input names (triggers, booleans, numbers)
 * 
 * ADDING NEW ANIMATIONS:
 * 1. Add a new entry to RIVE_ASSETS with a unique key
 * 2. Export the .riv file from Rive Editor with matching names
 * 3. Place the file in client/public/
 * 4. Run validation to ensure names match
 */

export interface RiveInputDefinition {
  name: string;
  type: 'trigger' | 'boolean' | 'number';
  description?: string;
}

export interface RiveViewModelProperty {
  name: string;
  type: 'color' | 'number' | 'boolean' | 'string';
  description?: string;
}

export interface RiveViewModelDefinition {
  name: string;
  properties: RiveViewModelProperty[];
}

export interface RiveAssetDefinition {
  id: string;
  src: string;
  artboard: string;
  stateMachine: string;
  inputs: RiveInputDefinition[];
  description?: string;
  preload?: boolean;
  viewModel?: RiveViewModelDefinition;
}

export const RIVE_ASSETS: Record<string, RiveAssetDefinition> = {
  heroDesktop: {
    id: 'heroDesktop',
    src: '/hero-desktop.riv',
    artboard: 'heroDesktop',
    stateMachine: 'heroDesktopState',
    inputs: [
      { name: 'isHover', type: 'boolean', description: 'Hover state for hero animation' },
    ],
    description: 'Main hero animation on landing page (desktop)',
    preload: true,
  },

  heroMobile: {
    id: 'heroMobile',
    src: '/hero-mobile.riv',
    artboard: 'heroMobile',
    stateMachine: 'heroMobileState',
    inputs: [
      { name: 'isHover', type: 'boolean', description: 'Hover state for hero animation' },
    ],
    description: 'Main hero animation on landing page (mobile)',
    preload: false,
  },

  romanticIcon: {
    id: 'romanticIcon',
    src: '/romantic.riv',
    artboard: 'romanticIcon',
    stateMachine: 'romanticIconState',
    inputs: [
      { name: 'romanticPlus', type: 'trigger', description: 'Fires when incrementing count' },
      { name: 'romanticMinus', type: 'trigger', description: 'Fires when decrementing count' },
      { name: 'reaction', type: 'trigger', description: 'Generic reaction trigger' },
    ],
    description: 'Romantic category icon animation',
    preload: true,
  },

  deepIcon: {
    id: 'deepIcon',
    src: '/deep.riv',
    artboard: 'deepIcon',
    stateMachine: 'deepIconState',
    inputs: [
      { name: 'deepPlus', type: 'trigger', description: 'Fires when incrementing count' },
      { name: 'deepMinus', type: 'trigger', description: 'Fires when decrementing count' },
      { name: 'reaction', type: 'trigger', description: 'Generic reaction trigger' },
    ],
    description: 'Deep category icon animation',
    preload: true,
  },

  naughtyIcon: {
    id: 'naughtyIcon',
    src: '/naughty.riv',
    artboard: 'naughtyIcon',
    stateMachine: 'naughtyIconState',
    inputs: [
      { name: 'naughtyPlus', type: 'trigger', description: 'Fires when incrementing count' },
      { name: 'naughtyMinus', type: 'trigger', description: 'Fires when decrementing count' },
      { name: 'reaction', type: 'trigger', description: 'Generic reaction trigger' },
    ],
    description: 'Naughty category icon animation',
    preload: true,
  },

  friendshipIcon: {
    id: 'friendshipIcon',
    src: '/friendship.riv',
    artboard: 'friendshipIcon',
    stateMachine: 'friendshipIconState',
    inputs: [
      { name: 'friendshipPlus', type: 'trigger', description: 'Fires when incrementing count' },
      { name: 'friendshipMinus', type: 'trigger', description: 'Fires when decrementing count' },
      { name: 'reaction', type: 'trigger', description: 'Generic reaction trigger' },
    ],
    description: 'Friendship category icon animation',
    preload: true,
  },

  playfulIcon: {
    id: 'playfulIcon',
    src: '/playful.riv',
    artboard: 'playfulIcon',
    stateMachine: 'playfulIconState',
    inputs: [
      { name: 'playfulPlus', type: 'trigger', description: 'Fires when incrementing count' },
      { name: 'playfulMinus', type: 'trigger', description: 'Fires when decrementing count' },
      { name: 'reaction', type: 'trigger', description: 'Generic reaction trigger' },
    ],
    description: 'Playful category icon animation',
    preload: true,
  },

  celebrationDesktop: {
    id: 'celebrationDesktop',
    src: '/celebration-desktop.riv',
    artboard: 'celebrationDesktop',
    stateMachine: 'celebrateDesktopState',
    inputs: [
      { name: 'celebrateDesktop', type: 'trigger', description: 'Fires the celebration animation' },
    ],
    description: 'Full-screen celebration animation for desktop when deck reaches 52 cards',
    preload: false,
  },

  celebrationMobile: {
    id: 'celebrationMobile',
    src: '/celebration-mobile.riv',
    artboard: 'celebrationMobile',
    stateMachine: 'celebrateMobileState',
    inputs: [
      { name: 'celebrateMobile', type: 'trigger', description: 'Fires the celebration animation' },
    ],
    description: 'Full-screen celebration animation for mobile when deck reaches 52 cards',
    preload: false,
  },

  originCardBack: {
    id: 'originCardBack',
    src: '/origin.riv',
    artboard: 'originCardBack',
    stateMachine: 'originState',
    inputs: [],
    description: 'Origin card back design',
    preload: false,
  },

  pulseCardBack: {
    id: 'pulseCardBack',
    src: '/pulse.riv',
    artboard: 'pulseCardBack',
    stateMachine: 'pulseState',
    inputs: [],
    description: 'Pulse card back design with animated effects',
    preload: false,
  },

  afterHoursCardBack: {
    id: 'afterHoursCardBack',
    src: '/afterhours.riv',
    artboard: 'afterHoursCardBack',
    stateMachine: 'afterHoursState',
    inputs: [],
    description: 'After Hours card back design',
    preload: false,
  },

  signatureCardBack: {
    id: 'signatureCardBack',
    src: '/signature.riv',
    artboard: 'signatureCardBack',
    stateMachine: 'signatureState',
    inputs: [],
    description: 'Signature card back design',
    preload: false,
  },

  sparkCardBack: {
    id: 'sparkCardBack',
    src: '/spark.riv',
    artboard: 'sparkCardBack',
    stateMachine: 'sparkState',
    inputs: [],
    description: 'Spark card back design',
    preload: false,
  },
};

/**
 * Get asset definition by ID
 */
export function getAsset(id: string): RiveAssetDefinition | undefined {
  return RIVE_ASSETS[id];
}

/**
 * Get all assets that should be preloaded
 */
export function getPreloadAssets(): RiveAssetDefinition[] {
  return Object.values(RIVE_ASSETS).filter(asset => asset.preload);
}

/**
 * Get category icon asset by category name
 */
export function getCategoryIconAsset(category: string): RiveAssetDefinition | undefined {
  const id = `${category}Icon`;
  return RIVE_ASSETS[id];
}

/**
 * Validate that a loaded Rive file matches expected inputs
 * Call this after loading to ensure the file exports match the manifest
 */
export function validateLoadedInputs(
  assetId: string,
  foundInputs: string[]
): { valid: boolean; missing: string[]; extra: string[] } {
  const asset = RIVE_ASSETS[assetId];
  if (!asset) {
    console.warn(`[Rive Manifest] Unknown asset ID: ${assetId}`);
    return { valid: false, missing: [], extra: foundInputs };
  }

  const expectedInputs = asset.inputs.map(i => i.name);
  const missing = expectedInputs.filter(name => !foundInputs.includes(name));
  const extra = foundInputs.filter(name => !expectedInputs.includes(name));

  if (missing.length > 0) {
    console.warn(`[Rive Manifest] Asset "${assetId}" missing inputs:`, missing);
  }
  if (extra.length > 0) {
    console.info(`[Rive Manifest] Asset "${assetId}" has extra inputs:`, extra);
  }

  return {
    valid: missing.length === 0,
    missing,
    extra,
  };
}

/**
 * Generate a report of all assets for documentation
 */
export function generateAssetReport(): string {
  const lines: string[] = ['# Rive Asset Manifest', ''];
  
  for (const [key, asset] of Object.entries(RIVE_ASSETS)) {
    lines.push(`## ${key}`);
    lines.push(`- **File:** \`${asset.src}\``);
    lines.push(`- **Artboard:** \`${asset.artboard}\``);
    lines.push(`- **State Machine:** \`${asset.stateMachine}\``);
    lines.push(`- **Description:** ${asset.description || 'N/A'}`);
    lines.push(`- **Preload:** ${asset.preload ? 'Yes' : 'No'}`);
    lines.push('- **Inputs:**');
    for (const input of asset.inputs) {
      lines.push(`  - \`${input.name}\` (${input.type}): ${input.description || ''}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
