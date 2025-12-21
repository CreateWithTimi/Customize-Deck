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
}: RiveCardBackProps) {
  return (
    <div 
      className={cn(
        "relative flex items-center justify-center overflow-hidden",
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
          opacity: 0.9,
        }}
      />
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div 
            className="h-20 w-20 md:h-24 md:w-24 rounded-full border-2 flex items-center justify-center"
            style={{ borderColor: `${colors.colorUp}40` }}
          >
            <div 
              className="h-12 w-12 md:h-14 md:w-14 rounded-full border flex items-center justify-center"
              style={{ borderColor: `${colors.colorDown}60` }}
            >
              <Sparkles 
                className="h-6 w-6 md:h-8 md:w-8" 
                style={{ color: `${colors.colorUp}` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.15) 55%, transparent 60%)",
          backgroundSize: "200% 100%",
        }}
      />
    </div>
  );
}
