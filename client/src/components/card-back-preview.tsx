import { cn } from "@/lib/utils";
import { RiveCardBack } from "./rive-card-back";

interface CardBackPreviewProps {
  designIndex: number;
  hue?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const baseDesigns = [
  { 
    gradient: "",
    pattern: "",
    accent: "multi",
    baseHue: 0,
    type: "custom" as const,
  },
  {
    gradient: "",
    pattern: "",
    accent: "purple",
    baseHue: 0,
    type: "rive" as const,
    riveAssetId: "originCardBack",
  },
  {
    gradient: "",
    pattern: "",
    accent: "cyan",
    baseHue: 0,
    type: "rive" as const,
    riveAssetId: "pulseCardBack",
  },
  {
    gradient: "",
    pattern: "",
    accent: "indigo",
    baseHue: 0,
    type: "rive" as const,
    riveAssetId: "afterHoursCardBack",
  },
];

const sizeClasses = {
  sm: "w-16 md:w-20",
  md: "w-32 md:w-40",
  lg: "w-40 md:w-48",
};

export function CardBackPreview({ 
  designIndex, 
  hue = 0, 
  className,
  size = "md" 
}: CardBackPreviewProps) {
  const design = baseDesigns[designIndex] || baseDesigns[0];
  const isRive = design.type === "rive";
  const isCustom = design.type === "custom";

  return (
    <div
      className={cn(
        "relative aspect-[2.5/3.5] rounded-xl overflow-hidden shadow-lg border-2 border-border/50",
        sizeClasses[size],
        className
      )}
    >
      {isRive && "riveAssetId" in design ? (
        <RiveCardBack
          assetId={design.riveAssetId}
          className="absolute inset-0"
        />
      ) : isCustom ? (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: `hsl(${hue}, 65%, 35%)`
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-white/30 flex items-center justify-center">
              <div className="h-6 w-6 md:h-7 md:w-7 rounded-full border border-white/40" />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
