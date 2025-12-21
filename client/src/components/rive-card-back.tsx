import { useEffect, useRef, useState } from "react";
import { getAsset } from "@/lib/rive-manifest";
import { cn } from "@/lib/utils";

interface RiveCardBackProps {
  assetId: string;
  className?: string;
  onReady?: () => void;
}

export function RiveCardBack({ 
  assetId, 
  className,
  onReady 
}: RiveCardBackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const riveRef = useRef<any>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const hasCalledOnReady = useRef(false);

  const assetDef = getAsset(assetId);

  useEffect(() => {
    if (!containerRef.current || !assetDef) return;

    let mounted = true;
    const container = containerRef.current;

    async function initRive() {
      try {
        const RiveModule = await import("@rive-app/webgl2");
        
        if (!mounted || !container) return;

        const canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.display = "block";
        
        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
        
        container.appendChild(canvas);
        canvasRef.current = canvas;

        const rive = new RiveModule.Rive({
          src: assetDef!.src,
          canvas: canvas,
          artboard: assetDef!.artboard,
          stateMachines: assetDef!.stateMachine,
          autoplay: true,
          onLoad: () => {
            if (!mounted) return;
            setIsLoaded(true);
            
            if (!hasCalledOnReady.current) {
              hasCalledOnReady.current = true;
              onReady?.();
            }

            const resizeCanvas = () => {
              if (!canvas || !container) return;
              const dpr = window.devicePixelRatio || 1;
              const rect = container.getBoundingClientRect();
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
            
            resizeCanvas();
          },
          onLoadError: (error) => {
            console.error(`[RiveCardBack] Failed to load "${assetId}":`, error);
          },
        });

        riveRef.current = rive;
      } catch (err) {
        console.error(`[RiveCardBack] Initialization failed:`, err);
      }
    }

    initRive();

    return () => {
      mounted = false;
      resizeObserverRef.current?.disconnect();
      if (riveRef.current) {
        riveRef.current.cleanup();
        riveRef.current = null;
      }
      if (canvasRef.current && container.contains(canvasRef.current)) {
        container.removeChild(canvasRef.current);
      }
      canvasRef.current = null;
    };
  }, [assetId, assetDef, onReady]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative overflow-hidden w-full h-full",
        className
      )}
      data-testid={`rive-card-back-${assetId}`}
    />
  );
}
