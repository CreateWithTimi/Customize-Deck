import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CATEGORIES, CATEGORY_META, REQUIRED_TOTAL, DeckConfig } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, Sparkles } from "lucide-react";

interface ProgressPanelProps {
  config: DeckConfig;
  onNext: () => void;
}

const colorMap: Record<string, string> = {
  rose: "bg-rose-500",
  indigo: "bg-indigo-500",
  orange: "bg-orange-500",
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
};

export function ProgressPanel({ config, onNext }: ProgressPanelProps) {
  const isComplete = config.total === REQUIRED_TOTAL;
  const remaining = REQUIRED_TOTAL - config.total;
  const percentage = (config.total / REQUIRED_TOTAL) * 100;

  return (
    <Card className="sticky top-4 p-6 md:p-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div
            className={cn(
              "mx-auto mb-4 flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-full transition-all duration-500",
              isComplete
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {isComplete ? (
              <div className="flex flex-col items-center">
                <Check className="h-8 w-8 md:h-10 md:w-10" />
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-2xl md:text-3xl font-bold">{config.total}</span>
                <span className="text-xs">/ {REQUIRED_TOTAL}</span>
              </div>
            )}
          </div>

          {isComplete ? (
            <div className="space-y-1">
              <h3 className="text-lg md:text-xl font-semibold text-primary flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5" />
                Deck Complete!
              </h3>
              <p className="text-sm text-muted-foreground">
                Your perfect mix is ready
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <h3 className="text-lg md:text-xl font-semibold">Build Your Mix</h3>
              <p className="text-sm text-muted-foreground">
                {remaining} more card{remaining !== 1 ? "s" : ""} to add
              </p>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <Progress value={percentage} className="h-3" />
          <p className="text-center text-sm text-muted-foreground">
            {config.total} of {REQUIRED_TOTAL} cards selected
          </p>
        </div>

        {/* Category breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Your Mix
          </h4>
          <div className="space-y-2">
            {CATEGORIES.map((category) => {
              const meta = CATEGORY_META[category];
              const count = config.counts[category];
              const catPercentage = config.total > 0 ? (count / config.total) * 100 : 0;

              return (
                <div key={category} className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-3 w-3 rounded-full shrink-0",
                      colorMap[meta.color]
                    )}
                  />
                  <span className="text-sm flex-1 min-w-0 truncate">{meta.label}</span>
                  <span className="text-sm font-medium tabular-nums">{count}</span>
                  <span className="text-xs text-muted-foreground w-10 text-right">
                    {catPercentage.toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Button */}
        <Button
          size="lg"
          className="w-full gap-2"
          disabled={!isComplete}
          onClick={onNext}
          data-testid="button-next-step"
        >
          Choose Card Back
          <ChevronRight className="h-4 w-4" />
        </Button>

        {!isComplete && (
          <p className="text-center text-xs text-muted-foreground">
            Complete your selection to continue
          </p>
        )}
      </div>
    </Card>
  );
}
