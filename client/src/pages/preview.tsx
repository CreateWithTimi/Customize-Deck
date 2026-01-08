import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { getDeckState, validations, generateDeckSummary, generateWhatsAppMessage, generateWhatsAppUrl } from "@/lib/deck-state";
import { CATEGORIES, CATEGORY_META, CARD_BACK_DESIGNS, REQUIRED_TOTAL, formatPrice, DECK_PRICE } from "@shared/schema";
import { StepIndicator } from "@/components/step-indicator";
import { ThemeToggle } from "@/components/theme-toggle";
import { CardBackPreview } from "@/components/card-back-preview";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Heart, ArrowLeft, Edit2, Check, MessageCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const colorMap: Record<string, string> = {
  rose: "bg-rose-500",
  indigo: "bg-indigo-500",
  orange: "bg-orange-500",
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
};

const WHATSAPP_NUMBER = "08165429119";

export default function Preview() {
  const [, navigate] = useLocation();
  const [config, setConfig] = useState(getDeckState);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isOrdering, setIsOrdering] = useState(false);

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

  const handleBetaOrder = () => {
    // Validate deck
    const errors = validations.getValidationErrors(config);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    setIsOrdering(true);

    // Generate deck summary
    const summary = generateDeckSummary(config);
    if (!summary) {
      setValidationErrors(["Unable to generate order summary. Please try again."]);
      setIsOrdering(false);
      return;
    }

    // Store summary for confirmation page
    sessionStorage.setItem("betaOrderSummary", JSON.stringify(summary));

    // Generate WhatsApp message and URL
    const message = generateWhatsAppMessage(summary);
    const whatsappUrl = generateWhatsAppUrl(WHATSAPP_NUMBER, message);

    // Open WhatsApp in new tab
    window.open(whatsappUrl, "_blank");

    // Navigate to confirmation page
    navigate("/beta-confirmation");
  };

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
            Make sure everything looks perfect before ordering
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
          {/* Category Breakdown */}
          <Card className="p-6 md:p-8">
            <div className="flex items-center justify-between gap-4 mb-6">
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
                    <div className="flex items-center justify-between gap-2">
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
                <div className="flex items-center justify-between gap-2">
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
            <div className="flex items-center justify-between gap-4 mb-6">
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
                52 premium cards with {selectedDesign?.name} design
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{formatPrice(DECK_PRICE)}</p>
              <p className="text-sm text-muted-foreground">Free shipping</p>
            </div>
          </div>
        </Card>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Card className="max-w-5xl mx-auto mt-4 p-4 border-destructive bg-destructive/10">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1">
                {validationErrors.map((error, index) => (
                  <p key={index} className="text-sm text-destructive">
                    {error}
                  </p>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Beta Order CTA */}
        <div className="flex flex-col items-center mt-8 space-y-3">
          <Button 
            size="lg" 
            className="gap-2" 
            onClick={handleBetaOrder}
            disabled={isOrdering}
            data-testid="button-order-beta"
          >
            <MessageCircle className="h-5 w-5" />
            {isOrdering ? "Opening WhatsApp..." : "Order (Beta)"}
          </Button>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            We're in beta. Orders are processed manually to ensure quality and collect feedback.
          </p>
        </div>
      </main>
    </div>
  );
}
