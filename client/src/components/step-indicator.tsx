import { Check } from "lucide-react";
import { STEPS } from "@shared/schema";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  className?: string;
}

export function StepIndicator({ currentStep, className }: StepIndicatorProps) {
  return (
    <div className={cn("w-full py-4", className)} data-testid="step-indicator">
      <div className="flex items-center justify-center gap-2 md:gap-4">
        {STEPS.slice(0, -1).map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isLast = index === STEPS.length - 2;

          return (
            <div key={step.id} className="flex items-center gap-2 md:gap-4">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                    isCompleted && "bg-primary border-primary text-primary-foreground",
                    isActive && "border-primary bg-primary/10 text-primary",
                    !isCompleted && !isActive && "border-muted-foreground/30 text-muted-foreground/50"
                  )}
                  data-testid={`step-indicator-${index}`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 md:h-5 md:w-5" />
                  ) : (
                    <span className="text-sm md:text-base font-semibold">{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs md:text-sm font-medium whitespace-nowrap transition-colors duration-300",
                    isCompleted && "text-primary",
                    isActive && "text-foreground",
                    !isCompleted && !isActive && "text-muted-foreground/50"
                  )}
                >
                  {step.name}
                </span>
              </div>

              {!isLast && (
                <div
                  className={cn(
                    "h-0.5 w-8 md:w-16 lg:w-24 transition-all duration-500",
                    isCompleted ? "bg-primary" : "bg-muted-foreground/20"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
