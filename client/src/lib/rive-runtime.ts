import { Rive, StateMachineInput, Layout, Fit, Alignment } from "@rive-app/canvas";
import { useRef, useEffect, useState, useCallback } from "react";

// Configuration for a Rive animation instance
export interface RiveConfig {
  canvasId: string;
  rivePath: string;
  artboardName?: string;  // Optional: specify which artboard to use
  stateMachineName: string;
  autoplay?: boolean;
}

export class RiveInstance {
  canvasId: string;
  rivePath: string;
  artboardName?: string;
  stateMachineName: string;
  autoplay: boolean;
  rive: Rive | null = null;
  inputs: Record<string, StateMachineInput> = {};
  isReady: boolean = false;
  resizeObserver: ResizeObserver | null = null;

  constructor(config: RiveConfig) {
    this.canvasId = config.canvasId;
    this.rivePath = config.rivePath;
    this.artboardName = config.artboardName;
    this.stateMachineName = config.stateMachineName;
    this.autoplay = config.autoplay ?? true;
  }

  async init(): Promise<boolean> {
    const canvas = document.getElementById(this.canvasId) as HTMLCanvasElement;
    if (!canvas) {
      console.warn(`[Rive] Canvas #${this.canvasId} not found`);
      return false;
    }

    try {
      this.rive = new Rive({
        src: this.rivePath,
        canvas: canvas,
        artboard: this.artboardName,
        stateMachines: this.stateMachineName,
        autoplay: this.autoplay,
        layout: new Layout({
          fit: Fit.Contain,
          alignment: Alignment.Center,
        }),
        onLoad: () => {
          this._onRiveLoaded();
        },
        onLoadError: (err) => {
          console.error("[Rive] Load error:", err);
          this.isReady = false;
        },
      });

      return true;
    } catch (err) {
      console.error("[Rive] Init failed:", err);
      return false;
    }
  }

  private _onRiveLoaded(): void {
    console.log("[Rive] File loaded successfully");

    try {
      if (!this.rive) return;
      
      const inputs = this.rive.stateMachineInputs(this.stateMachineName);

      if (inputs && inputs.length > 0) {
        inputs.forEach((input) => {
          this.inputs[input.name] = input;
          console.log(`[Rive] Found input: ${input.name}`);
        });

        this.isReady = true;
        console.log("[Rive] Ready!");
        this._setupResize();
      } else {
        console.warn("[Rive] No inputs found in state machine");
        this.isReady = true;
        this._setupResize();
      }
    } catch (err) {
      console.error("[Rive] Failed to get inputs:", err);
      this.isReady = false;
    }
  }

  private _setupResize(): void {
    const canvas = document.getElementById(this.canvasId) as HTMLCanvasElement;
    if (!canvas) return;

    this.resizeObserver = new ResizeObserver(() => {
      if (!this.rive) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      this.rive.resizeDrawingSurfaceToCanvas();
    });

    this.resizeObserver.observe(canvas);

    // Initial resize
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    this.rive?.resizeDrawingSurfaceToCanvas();
  }

  setNumber(inputName: string, value: number): boolean {
    if (!this.isReady || !this.inputs[inputName]) {
      console.warn(`[Rive] Input "${inputName}" not available`);
      return false;
    }

    this.inputs[inputName].value = value;
    console.log(`[Rive] Set ${inputName} = ${value}`);
    return true;
  }

  setBoolean(inputName: string, value: boolean): boolean {
    if (!this.isReady || !this.inputs[inputName]) {
      return false;
    }

    this.inputs[inputName].value = value;
    return true;
  }

  fire(triggerName: string): boolean {
    if (!this.isReady || !this.inputs[triggerName]) {
      console.warn(`[Rive] Trigger "${triggerName}" not available`);
      return false;
    }

    this.inputs[triggerName].fire();
    console.log(`[Rive] Fired: ${triggerName}`);
    return true;
  }

  dispose(): void {
    console.log("[Rive] Disposing instance");

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.rive) {
      this.rive.cleanup();
      this.rive = null;
    }

    this.inputs = {};
    this.isReady = false;
  }
}

export const RiveManager = {
  instances: new Map<string, RiveInstance>(),

  register(id: string, instance: RiveInstance): void {
    this.instances.set(id, instance);
  },

  get(id: string): RiveInstance | undefined {
    return this.instances.get(id);
  },

  disposeAll(): void {
    this.instances.forEach((instance) => instance.dispose());
    this.instances.clear();
  },
};

// Auto-cleanup on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    RiveManager.disposeAll();
  });
}

// React hook for Rive animations with ref-based canvas management
export interface UseRiveConfig {
  src: string;
  artboardName?: string;
  stateMachineName: string;
  autoplay?: boolean;
}

export function useRiveAnimation(config: UseRiveConfig | null) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const riveRef = useRef<Rive | null>(null);
  const inputsRef = useRef<Record<string, StateMachineInput>>({});
  const [isReady, setIsReady] = useState(false);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (!config || !containerRef.current) return;

    // Create canvas element
    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    containerRef.current.appendChild(canvas);
    canvasRef.current = canvas;

    // Initialize Rive
    const rive = new Rive({
      src: config.src,
      canvas: canvas,
      artboard: config.artboardName,
      stateMachines: config.stateMachineName,
      autoplay: config.autoplay ?? true,
      layout: new Layout({
        fit: Fit.Contain,
        alignment: Alignment.Center,
      }),
      onLoad: () => {
        const inputs = rive.stateMachineInputs(config.stateMachineName);
        if (inputs) {
          inputs.forEach((input) => {
            inputsRef.current[input.name] = input;
            console.log(`[Rive] Found input: ${input.name}`);
          });
        }
        setIsReady(true);

        // Setup resize observer
        const observer = new ResizeObserver(() => {
          const dpr = window.devicePixelRatio || 1;
          const rect = canvas.getBoundingClientRect();
          canvas.width = rect.width * dpr;
          canvas.height = rect.height * dpr;
          rive.resizeDrawingSurfaceToCanvas();
        });
        observer.observe(canvas);
        resizeObserverRef.current = observer;

        // Initial resize
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        rive.resizeDrawingSurfaceToCanvas();
      },
    });

    riveRef.current = rive;

    return () => {
      resizeObserverRef.current?.disconnect();
      rive.cleanup();
      if (canvasRef.current && containerRef.current) {
        containerRef.current.removeChild(canvasRef.current);
      }
      canvasRef.current = null;
      riveRef.current = null;
      inputsRef.current = {};
      setIsReady(false);
    };
  }, [config?.src, config?.artboardName, config?.stateMachineName, config?.autoplay]);

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
      console.log(`[Rive Hook] Fired: ${name}`);
    } else {
      console.warn(`[Rive Hook] Trigger not found: ${name}. Available: ${Object.keys(inputsRef.current).join(', ')}`);
    }
  }, []);

  return {
    containerRef,
    isReady,
    setBoolean,
    setNumber,
    fire,
  };
}
