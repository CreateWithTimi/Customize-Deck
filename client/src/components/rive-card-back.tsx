import { useEffect, useRef } from "react";
import { useRiveManaged } from "@/lib/rive-manager";
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
  const hasCalledOnReady = useRef(false);

  const { containerRef, isReady } = useRiveManaged({
    assetId,
    autoplay: true,
    pauseWhenHidden: true,
  });

  useEffect(() => {
    if (isReady && !hasCalledOnReady.current) {
      hasCalledOnReady.current = true;
      onReady?.();
    }
  }, [isReady, onReady]);

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
