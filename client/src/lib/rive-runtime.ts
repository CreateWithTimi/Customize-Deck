import { Rive, StateMachineInput } from "@rive-app/canvas";

export class RiveInstance {
  canvasId: string;
  rivePath: string;
  stateMachineName: string;
  rive: Rive | null = null;
  inputs: Record<string, StateMachineInput> = {};
  isReady: boolean = false;
  resizeObserver: ResizeObserver | null = null;

  constructor(canvasId: string, rivePath: string, stateMachineName: string) {
    this.canvasId = canvasId;
    this.rivePath = rivePath;
    this.stateMachineName = stateMachineName;
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
        stateMachines: this.stateMachineName,
        autoplay: true,
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
    this.rive.resizeDrawingSurfaceToCanvas();
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
