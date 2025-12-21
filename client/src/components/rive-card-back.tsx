import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

export interface CardBackColors {
  colorUp: string;
  colorDown: string;
  backgroundColor: string;
}

interface RiveCardBackProps {
  assetId: string;
  colors: CardBackColors;
  className?: string;
  onReady?: () => void;
}

export function RiveCardBack({ 
  assetId, 
  colors, 
  className,
  onReady 
}: RiveCardBackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const riveRef = useRef<any>(null);
  const viewModelInstanceRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    async function initRive() {
      if (!canvasRef.current) return;

      try {
        const RiveModule = await import("@rive-app/webgl2");
        
        const riveInstance = new RiveModule.Rive({
          src: '/origin.riv',
          canvas: canvasRef.current,
          artboard: 'originCardBack',
          stateMachines: 'originState',
          autoplay: true,
          onLoad: () => {
            if (!mounted) return;
            
            try {
              const defaultVM = riveInstance.defaultViewModelInstance;
              
              if (defaultVM) {
                viewModelInstanceRef.current = defaultVM;
                
                const colorUpProp = defaultVM.color('colorUp');
                const colorDownProp = defaultVM.color('colorDown');
                const bgColorProp = defaultVM.color('backgroundColor');

                if (colorUpProp) {
                  const rgb = hexToRgb(colors.colorUp);
                  colorUpProp.setRgb(rgb.r, rgb.g, rgb.b);
                }
                if (colorDownProp) {
                  const rgb = hexToRgb(colors.colorDown);
                  colorDownProp.setRgb(rgb.r, rgb.g, rgb.b);
                }
                if (bgColorProp) {
                  const rgb = hexToRgb(colors.backgroundColor);
                  bgColorProp.setRgb(rgb.r, rgb.g, rgb.b);
                }
              }
              
              setIsLoaded(true);
              onReady?.();
            } catch (err) {
              console.warn('View model binding failed, using fallback:', err);
              setHasError(true);
              setIsLoaded(true);
              onReady?.();
            }
          },
          onLoadError: () => {
            if (!mounted) return;
            console.warn('Rive file failed to load, using fallback');
            setHasError(true);
            setIsLoaded(true);
            onReady?.();
          },
        });

        riveRef.current = riveInstance;
      } catch (err) {
        console.warn('Rive initialization failed, using fallback:', err);
        if (mounted) {
          setHasError(true);
          setIsLoaded(true);
          onReady?.();
        }
      }
    }

    initRive();

    return () => {
      mounted = false;
      if (riveRef.current) {
        riveRef.current.cleanup();
        riveRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!viewModelInstanceRef.current || hasError) return;

    try {
      const vm = viewModelInstanceRef.current;
      
      const colorUpProp = vm.color('colorUp');
      const colorDownProp = vm.color('colorDown');
      const bgColorProp = vm.color('backgroundColor');

      if (colorUpProp) {
        const rgb = hexToRgb(colors.colorUp);
        colorUpProp.setRgb(rgb.r, rgb.g, rgb.b);
      }
      if (colorDownProp) {
        const rgb = hexToRgb(colors.colorDown);
        colorDownProp.setRgb(rgb.r, rgb.g, rgb.b);
      }
      if (bgColorProp) {
        const rgb = hexToRgb(colors.backgroundColor);
        bgColorProp.setRgb(rgb.r, rgb.g, rgb.b);
      }
    } catch (err) {
      console.warn('Color update failed:', err);
    }
  }, [colors, hasError]);

  if (hasError || !isLoaded) {
    return (
      <div 
        ref={containerRef}
        className={cn(
          "relative overflow-hidden rounded-md",
          className
        )}
        style={{ 
          backgroundColor: colors.backgroundColor,
        }}
        data-testid={`rive-card-back-${assetId}`}
      >
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${colors.colorUp} 0%, ${colors.colorDown} 100%)`,
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div 
              className="absolute inset-0 blur-xl opacity-60"
              style={{ backgroundColor: colors.colorUp }}
            />
            <Sparkles className="relative h-12 w-12 text-white/80" />
          </div>
        </div>
        {!isLoaded && (
          <canvas 
            ref={canvasRef}
            className="absolute inset-0 w-full h-full opacity-0"
          />
        )}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-md",
        className
      )}
      data-testid={`rive-card-back-${assetId}`}
    >
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  return {
    r: parseInt(cleanHex.substring(0, 2), 16),
    g: parseInt(cleanHex.substring(2, 4), 16),
    b: parseInt(cleanHex.substring(4, 6), 16),
  };
}
