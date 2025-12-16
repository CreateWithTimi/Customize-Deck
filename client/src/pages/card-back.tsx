import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { getDeckState, setCardBack, validations } from "@/lib/deck-state";
import { StepIndicator } from "@/components/step-indicator";
import { CardBackCarousel } from "@/components/card-back-carousel";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft, ChevronRight } from "lucide-react";

export default function CardBack() {
  const [, navigate] = useLocation();
  const [config, setConfig] = useState(getDeckState);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    config.cardBackIndex
  );

  useEffect(() => {
    const currentConfig = getDeckState();
    setConfig(currentConfig);

    // Page guard: redirect if deck not complete
    if (!validations.canProceedToCardBack(currentConfig)) {
      navigate("/customize");
    }
  }, [navigate]);

  const handleSelect = (index: number, designId: string) => {
    setSelectedIndex(index);
    const newState = setCardBack(designId, index);
    setConfig(newState);
  };

  const handleNext = () => {
    if (selectedIndex !== null) {
      navigate("/preview");
    }
  };

  const canProceed = selectedIndex !== null;

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
          <StepIndicator currentStep={1} />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Back link */}
        <Link href="/customize">
          <Button variant="ghost" className="gap-2 mb-6" data-testid="button-back-customize">
            <ArrowLeft className="h-4 w-4" />
            Back to Build
          </Button>
        </Link>

        <div className="mb-12 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Choose Your Card Back
          </h1>
          <p className="text-muted-foreground">
            Select a premium design that matches your style. One design applies to
            all 52 cards.
          </p>
        </div>

        {/* Carousel */}
        <div className="max-w-4xl mx-auto">
          <CardBackCarousel
            selectedIndex={selectedIndex}
            onSelect={handleSelect}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-center mt-12">
          <Button
            size="lg"
            className="gap-2"
            disabled={!canProceed}
            onClick={handleNext}
            data-testid="button-continue-preview"
          >
            Continue to Preview
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}
