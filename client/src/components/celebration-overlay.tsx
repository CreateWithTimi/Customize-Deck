import { useEffect, useState, useRef, useCallback } from "react";
import { useRiveManaged } from "@/lib/rive-manager";

interface CelebrationOverlayProps {
  show: boolean;
  onComplete?: () => void;
  duration?: number;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
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
  const isMobile = useIsMobile();

  const assetId = isMobile ? "celebrationMobile" : "celebrationDesktop";
  const triggerName = isMobile ? "celebrateMobile" : "celebrateDesktop";

  const riveAnimation = useRiveManaged(
    shouldRender ? { assetId, autoplay: true, pauseWhenHidden: false } : null
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
      riveAnimation.fire(triggerName);
    }
  }, [visible, riveAnimation.isReady, riveAnimation, triggerName]);

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
