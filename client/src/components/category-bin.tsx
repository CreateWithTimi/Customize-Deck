import { Minus, Plus, Heart, Brain, Flame, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Category, CATEGORY_META, REQUIRED_TOTAL } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useRiveAnimation } from "@/lib/rive-runtime";
import { useCallback } from "react";

const iconMap = {
  Heart,
  Brain,
  Flame,
  Users,
  Sparkles,
};

const colorMap: Record<string, { bg: string; border: string; text: string; accent: string }> = {
  rose: {
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-800",
    text: "text-rose-700 dark:text-rose-300",
    accent: "bg-rose-500",
  },
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    border: "border-indigo-200 dark:border-indigo-800",
    text: "text-indigo-700 dark:text-indigo-300",
    accent: "bg-indigo-500",
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-200 dark:border-orange-800",
    text: "text-orange-700 dark:text-orange-300",
    accent: "bg-orange-500",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-300",
    accent: "bg-emerald-500",
  },
  violet: {
    bg: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-200 dark:border-violet-800",
    text: "text-violet-700 dark:text-violet-300",
    accent: "bg-violet-500",
  },
};

const riveConfigMap: Record<Category, { artboardName: string; stateMachineName: string; plusTrigger: string; minusTrigger: string; reactTrigger: string } | null> = {
  romantic: {
    artboardName: "ROMANTIC",
    stateMachineName: "State Machine 1",
    plusTrigger: "romantic_plus",
    minusTrigger: "romantic_minus",
    reactTrigger: "react",
  },
  deep: null,
  naughty: null,
  friendship: null,
  playful: null,
};

interface CategoryBinProps {
  category: Category;
  count: number;
  total: number;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled?: boolean;
}

export function CategoryBin({
  category,
  count,
  total,
  onIncrement,
  onDecrement,
  disabled,
}: CategoryBinProps) {
  const meta = CATEGORY_META[category];
  const colors = colorMap[meta.color];
  const Icon = iconMap[meta.icon as keyof typeof iconMap];
  const canIncrement = total < REQUIRED_TOTAL;
  const canDecrement = count > 0;
  const percentage = (count / REQUIRED_TOTAL) * 100;

  const riveConfig = riveConfigMap[category];
  
  const { containerRef, fire, isReady } = useRiveAnimation(
    riveConfig ? {
      src: "/ui.riv",
      artboardName: riveConfig.artboardName,
      stateMachineName: riveConfig.stateMachineName,
      autoplay: true,
    } : null
  );

  const handleIncrement = useCallback(() => {
    if (riveConfig && isReady) {
      fire(riveConfig.plusTrigger);
      fire(riveConfig.reactTrigger);
    }
    onIncrement();
  }, [riveConfig, isReady, fire, onIncrement]);

  const handleDecrement = useCallback(() => {
    if (riveConfig && isReady) {
      fire(riveConfig.minusTrigger);
      fire(riveConfig.reactTrigger);
    }
    onDecrement();
  }, [riveConfig, isReady, fire, onDecrement]);

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        colors.bg,
        colors.border,
        "border-2"
      )}
      data-testid={`category-bin-${category}`}
    >
      <div className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
            {riveConfig ? (
              <div
                ref={containerRef}
                className="h-10 w-10 md:h-12 md:w-12 shrink-0 rounded-lg"
              />
            ) : (
              <div
                className={cn(
                  "flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-lg",
                  colors.accent,
                  "text-white"
                )}
              >
                <Icon className="h-5 w-5 md:h-6 md:w-6" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className={cn("font-semibold text-base md:text-lg", colors.text)}>
                {meta.label}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                {meta.description}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-end gap-2 md:gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={handleDecrement}
              disabled={disabled || !canDecrement}
              className="h-10 w-10 md:h-10 md:w-10 rounded-full"
              data-testid={`button-decrement-${category}`}
            >
              <Minus className="h-4 w-4" />
            </Button>

            <div
              className={cn(
                "flex h-10 w-16 md:h-12 md:w-16 items-center justify-center rounded-lg font-bold text-lg md:text-xl",
                colors.bg,
                colors.text,
                "border",
                colors.border
              )}
              data-testid={`count-${category}`}
            >
              {count}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleIncrement}
              disabled={disabled || !canIncrement}
              className="h-10 w-10 md:h-10 md:w-10 rounded-full"
              data-testid={`button-increment-${category}`}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
          <div
            className={cn("h-full rounded-full transition-all duration-300", colors.accent)}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </Card>
  );
}
