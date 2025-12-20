import { useEffect, useState, useRef, useCallback } from "react";
import { useRiveManaged } from "@/lib/rive-manager";

interface CelebrationOverlayProps {
  show: boolean;
  onComplete?: () => void;
  duration?: number;
}

export function CelebrationOverlay({ 
  show, 
  onComplete, 
  duration = 3000 
}: CelebrationOverlayProps) {
  const [visible, setVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const hasTriggeredRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const riveAnimation = useRiveManaged(
    shouldRender ? { assetId: "celebrationDesktop", autoplay: true, pauseWhenHidden: false } : null
  );

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (show && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      setShouldRender(true);
      setVisible(true);

      cleanup();
      timeoutRef.current = setTimeout(() => {
        setVisible(false);
        setShouldRender(false);
        onComplete?.();
      }, duration);
    }

    if (!show) {
      hasTriggeredRef.current = false;
      cleanup();
    }

    return cleanup;
  }, [show, duration, onComplete, cleanup]);

  useEffect(() => {
    if (visible && riveAnimation.isReady) {
      riveAnimation.fire("celebrateDesktop");
    }
  }, [visible, riveAnimation.isReady, riveAnimation]);

  if (!visible) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] pointer-events-none"
      data-testid="celebration-overlay"
    >
      <div 
        ref={riveAnimation.containerRef}
        className="w-full h-full"
      />
    </div>
  );
}
