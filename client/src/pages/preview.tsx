import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { getDeckState, validations } from "@/lib/deck-state";
import { CATEGORIES, CATEGORY_META, CARD_BACK_DESIGNS, REQUIRED_TOTAL } from "@shared/schema";
import { StepIndicator } from "@/components/step-indicator";
import { ThemeToggle } from "@/components/theme-toggle";
import { CardBackPreview } from "@/components/card-back-preview";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Heart, ArrowLeft, ChevronRight, Edit2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const colorMap: Record<string, string> = {
  rose: "bg-rose-500",
  indigo: "bg-indigo-500",
  orange: "bg-orange-500",
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
};

export default function Preview() {
  const [, navigate] = useLocation();
  const [config, setConfig] = useState(getDeckState);

  useEffect(() => {
    const currentConfig = getDeckState();
    setConfig(currentConfig);

    // Page guard
    if (!validations.canProceedToPreview(currentConfig)) {
      if (!validations.canProceedToCardBack(currentConfig)) {
        navigate("/customize");
      } else {
        navigate("/card-back");
      }
    }
  }, [navigate]);

  const selectedDesign = CARD_BACK_DESIGNS.find(
    (d) => d.id === config.cardBackDesign
  );
  const designIndex = config.cardBackIndex ?? 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">DeckBuilder</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Step Indicator */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4">
          <StepIndicator currentStep={2} />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Back link */}
        <Link href="/card-back">
          <Button variant="ghost" className="gap-2 mb-6" data-testid="button-back-cardback">
            <ArrowLeft className="h-4 w-4" />
            Back to Card Back
          </Button>
        </Link>

        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Review Your Deck</h1>
          <p className="text-muted-foreground">
            Make sure everything looks perfect before checkout
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
          {/* Category Breakdown */}
          <Card className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Your Card Mix</h2>
              <Link href="/customize">
                <Button variant="ghost" size="sm" className="gap-2" data-testid="button-edit-mix">
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {CATEGORIES.map((category) => {
                const meta = CATEGORY_META[category];
                const count = config.counts[category];
                const percentage = (count / REQUIRED_TOTAL) * 100;

                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "h-3 w-3 rounded-full",
                            colorMap[meta.color]
                          )}
                        />
                        <span className="font-medium">{meta.label}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {count} cards ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}

              <div className="pt-4 mt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-primary">
                      {config.total} / {REQUIRED_TOTAL} cards
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Card Back Preview */}
          <Card className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Card Back Design</h2>
              <Link href="/card-back">
                <Button variant="ghost" size="sm" className="gap-2" data-testid="button-edit-design">
                  <Edit2 className="h-4 w-4" />
                  Change
                </Button>
              </Link>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <CardBackPreview 
                designIndex={designIndex} 
                hue={config.cardBackHue || 0} 
                size="lg"
                data-testid="preview-card-back"
              />

              {selectedDesign && (
                <div className="text-center">
                  <p className="font-semibold">{selectedDesign.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedDesign.description}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Order Summary */}
        <Card className="max-w-5xl mx-auto mt-8 p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg">Custom Conversation Deck</h3>
              <p className="text-sm text-muted-foreground">
                52 premium cards • {selectedDesign?.name} design
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">$29.99</p>
              <p className="text-sm text-muted-foreground">Free shipping</p>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="flex justify-center mt-8">
          <Link href="/checkout">
            <Button size="lg" className="gap-2" data-testid="button-proceed-checkout">
              Proceed to Checkout
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
