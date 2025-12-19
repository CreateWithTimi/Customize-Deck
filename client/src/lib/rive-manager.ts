/**
 * Centralized Rive Animation Manager
 * 
 * Provides:
 * - Asset caching (files only downloaded once)
 * - Visibility-based pause/resume (saves CPU when offscreen)
 * - Proper lifecycle management and cleanup
 * - Validation against manifest
 */

import { Rive, StateMachineInput, Layout, Fit, Alignment } from "@rive-app/canvas";
import { useRef, useEffect, useState, useCallback } from "react";
import { getAsset, validateLoadedInputs, type RiveAssetDefinition } from "./rive-manifest";

interface CachedAsset {
  buffer: ArrayBuffer;
  loadedAt: number;
}

interface ManagedAnimation {
  id: string;
  rive: Rive;
  canvas: HTMLCanvasElement;
  container: HTMLDivElement;
  inputs: Record<string, StateMachineInput>;
  isVisible: boolean;
  isPaused: boolean;
  resizeObserver: ResizeObserver | null;
  visibilityObserver: IntersectionObserver | null;
}

class RiveAssetManager {
  private assetCache: Map<string, CachedAsset> = new Map();
  private loadingPromises: Map<string, Promise<ArrayBuffer>> = new Map();
  private animations: Map<string, ManagedAnimation> = new Map();
  private globalPaused: boolean = false;

  /**
   * Preload an asset into cache
   */
  async preload(src: string): Promise<void> {
    if (this.assetCache.has(src)) return;
    await this.loadAsset(src);
  }

  /**
   * Preload multiple assets in parallel
   */
  async preloadAll(sources: string[]): Promise<void> {
    await Promise.all(sources.map(src => this.preload(src)));
  }

  /**
   * Load asset with caching and deduplication
   */
  private async loadAsset(src: string): Promise<ArrayBuffer> {
    if (this.assetCache.has(src)) {
      return this.assetCache.get(src)!.buffer;
    }

    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!;
    }

    const loadPromise = fetch(src)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load Rive asset: ${src} (${response.status})`);
        }
        return response.arrayBuffer();
      })
      .then(buffer => {
        this.assetCache.set(src, {
          buffer,
          loadedAt: Date.now(),
        });
        this.loadingPromises.delete(src);
        return buffer;
      })
      .catch(error => {
        this.loadingPromises.delete(src);
        throw error;
      });

    this.loadingPromises.set(src, loadPromise);
    return loadPromise;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { assetCount: number; totalBytes: number } {
    let totalBytes = 0;
    this.assetCache.forEach(asset => {
      totalBytes += asset.buffer.byteLength;
    });
    return {
      assetCount: this.assetCache.size,
      totalBytes,
    };
  }

  /**
   * Clear the asset cache
   */
  clearCache(): void {
    this.assetCache.clear();
    this.loadingPromises.clear();
  }

  /**
   * Pause all animations (for background tab, etc.)
   */
  pauseAll(): void {
    this.globalPaused = true;
    this.animations.forEach(anim => {
      if (!anim.isPaused) {
        anim.rive.pause();
        anim.isPaused = true;
      }
    });
  }

  /**
   * Resume all visible animations
   */
  resumeAll(): void {
    this.globalPaused = false;
    this.animations.forEach(anim => {
      if (anim.isPaused && anim.isVisible) {
        anim.rive.play();
        anim.isPaused = false;
      }
    });
  }

  /**
   * Dispose all animations and clear cache
   */
  disposeAll(): void {
    this.animations.forEach(anim => {
      anim.resizeObserver?.disconnect();
      anim.visibilityObserver?.disconnect();
      anim.rive.cleanup();
    });
    this.animations.clear();
    this.clearCache();
  }
}

export const riveManager = new RiveAssetManager();

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    riveManager.disposeAll();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      riveManager.pauseAll();
    } else {
      riveManager.resumeAll();
    }
  });
}

export interface UseRiveManagedConfig {
  assetId: string;
  autoplay?: boolean;
  pauseWhenHidden?: boolean;
}

export function useRiveManaged(config: UseRiveManagedConfig | null) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const riveRef = useRef<Rive | null>(null);
  const inputsRef = useRef<Record<string, StateMachineInput>>({});
  const [isReady, setIsReady] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const visibilityObserverRef = useRef<IntersectionObserver | null>(null);

  const assetDef = config ? getAsset(config.assetId) : null;

  useEffect(() => {
    if (!config || !assetDef || !containerRef.current) return;

    const container = containerRef.current;
    const pauseWhenHidden = config.pauseWhenHidden ?? true;

    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvas.style.imageRendering = "auto";

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    container.appendChild(canvas);
    canvasRef.current = canvas;

    const rive = new Rive({
      src: assetDef.src,
      canvas: canvas,
      artboard: assetDef.artboard,
      stateMachines: assetDef.stateMachine,
      autoplay: config.autoplay ?? true,
      layout: new Layout({
        fit: Fit.Contain,
        alignment: Alignment.Center,
      }),
      onLoad: () => {
        const inputs = rive.stateMachineInputs(assetDef.stateMachine);
        const foundInputNames: string[] = [];
        
        if (inputs) {
          inputs.forEach((input) => {
            const trimmedName = input.name.trim();
            inputsRef.current[trimmedName] = input;
            foundInputNames.push(trimmedName);
          });
        }

        const validation = validateLoadedInputs(config.assetId, foundInputNames);
        if (!validation.valid) {
          console.warn(`[Rive Manager] Asset "${config.assetId}" validation failed. Missing inputs:`, validation.missing);
        }

        setIsReady(true);

        const resizeCanvas = () => {
          const dpr = window.devicePixelRatio || 1;
          const rect = canvas.getBoundingClientRect();
          const width = Math.round(rect.width * dpr);
          const height = Math.round(rect.height * dpr);

          if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            rive.resizeDrawingSurfaceToCanvas();
          }
        };

        const resizeObserver = new ResizeObserver(resizeCanvas);
        resizeObserver.observe(container);
        resizeObserverRef.current = resizeObserver;

        if (pauseWhenHidden) {
          const visibilityObserver = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                const visible = entry.isIntersecting;
                setIsVisible(visible);
                if (visible) {
                  rive.play();
                } else {
                  rive.pause();
                }
              });
            },
            { threshold: 0.1 }
          );
          visibilityObserver.observe(container);
          visibilityObserverRef.current = visibilityObserver;
        }

        resizeCanvas();
      },
      onLoadError: (error) => {
        console.error(`[Rive Manager] Failed to load "${config.assetId}":`, error);
      },
    });

    riveRef.current = rive;

    return () => {
      resizeObserverRef.current?.disconnect();
      visibilityObserverRef.current?.disconnect();
      rive.cleanup();
      if (canvasRef.current && container) {
        container.removeChild(canvasRef.current);
      }
      canvasRef.current = null;
      riveRef.current = null;
      inputsRef.current = {};
      setIsReady(false);
    };
  }, [config?.assetId, config?.autoplay, config?.pauseWhenHidden, assetDef]);

  const setBoolean = useCallback((name: string, value: boolean) => {
    if (inputsRef.current[name]) {
      inputsRef.current[name].value = value;
    }
  }, []);

  const setNumber = useCallback((name: string, value: number) => {
    if (inputsRef.current[name]) {
      inputsRef.current[name].value = value;
    }
  }, []);

  const fire = useCallback((name: string) => {
    if (inputsRef.current[name]) {
      inputsRef.current[name].fire();
    }
  }, []);

  const pause = useCallback(() => {
    riveRef.current?.pause();
  }, []);

  const play = useCallback(() => {
    riveRef.current?.play();
  }, []);

  return {
    containerRef,
    isReady,
    isVisible,
    setBoolean,
    setNumber,
    fire,
    pause,
    play,
    assetDef,
  };
}

export type { RiveAssetDefinition };
