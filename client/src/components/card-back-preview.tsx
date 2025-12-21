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
    gradient: "from-gray-900 via-gray-800 to-gray-900",
    pattern: "radial-gradient(circle at 30% 20%, rgba(255,215,0,0.3) 0%, transparent 50%)",
    accent: "gold",
    baseHue: 0,
    type: "static" as const,
  },
  { 
    gradient: "from-rose-400 via-pink-300 to-rose-400",
    pattern: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 0%, transparent 70%)",
    accent: "white",
    baseHue: 340,
    type: "static" as const,
  },
  { 
    gradient: "from-indigo-800 via-blue-700 to-indigo-800",
    pattern: "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.2) 0%, transparent 40%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)",
    accent: "white",
    baseHue: 230,
    type: "static" as const,
  },
  { 
    gradient: "from-stone-200 via-white to-stone-200",
    pattern: "linear-gradient(45deg, rgba(212,175,55,0.3) 0%, transparent 50%, rgba(212,175,55,0.3) 100%)",
    accent: "gold",
    baseHue: 40,
    type: "static" as const,
  },
  { 
    gradient: "from-red-600 via-rose-500 to-red-600",
    pattern: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)",
    accent: "white",
    baseHue: 0,
    type: "static" as const,
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
  const hueRotation = hue - (design.baseHue || 0);
  const isRive = design.type === "rive";

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
      ) : (
        <>
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br",
              design.gradient
            )}
            style={{ filter: `hue-rotate(${hueRotation}deg)` }}
          />
          <div
            className="absolute inset-0"
            style={{ background: design.pattern }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className={cn(
                "h-10 w-10 md:h-12 md:w-12 rounded-full border-2 flex items-center justify-center",
                design.accent === "gold" ? "border-yellow-400/40" : "border-white/30"
              )}
            >
              <div 
                className={cn(
                  "h-6 w-6 md:h-7 md:w-7 rounded-full border",
                  design.accent === "gold" ? "border-yellow-400/60" : "border-white/40"
                )} 
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
