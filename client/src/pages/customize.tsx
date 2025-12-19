import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { CATEGORIES, Category, REQUIRED_TOTAL } from "@shared/schema";
import { getDeckState, updateCategoryCount } from "@/lib/deck-state";
import { StepIndicator } from "@/components/step-indicator";
import { CategoryBin } from "@/components/category-bin";
import { ProgressPanel } from "@/components/progress-panel";
import { CelebrationOverlay } from "@/components/celebration-overlay";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft } from "lucide-react";

export default function Customize() {
  const [, navigate] = useLocation();
  const [config, setConfig] = useState(getDeckState);
  const [showCelebration, setShowCelebration] = useState(false);
  const prevTotalRef = useRef<number>(0);

  useEffect(() => {
    const state = getDeckState();
    setConfig(state);
    prevTotalRef.current = state.total;
  }, []);

  useEffect(() => {
    if (prevTotalRef.current !== REQUIRED_TOTAL && config.total === REQUIRED_TOTAL) {
      setShowCelebration(true);
    }
    prevTotalRef.current = config.total;
  }, [config.total]);

  const handleIncrement = (category: Category) => {
    const newState = updateCategoryCount(category, 1);
    if (newState) {
      setConfig(newState);
    }
  };

  const handleDecrement = (category: Category) => {
    const newState = updateCategoryCount(category, -1);
    if (newState) {
      setConfig(newState);
    }
  };

  const handleNext = () => {
    navigate("/card-back");
  };

  return (
    <div className="min-h-screen bg-background">
      <CelebrationOverlay 
        show={showCelebration} 
        onComplete={() => setShowCelebration(false)}
        duration={3000}
      />

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
          <StepIndicator currentStep={0} />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Back link */}
        <Link href="/">
          <Button variant="ghost" className="gap-2 mb-6" data-testid="button-back-home">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Build Your Deck</h1>
          <p className="text-muted-foreground">
            Choose how many cards from each category. Your deck must have exactly 52 cards.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr,380px]">
          {/* Category Bins */}
          <div className="space-y-4">
            {CATEGORIES.map((category) => (
              <CategoryBin
                key={category}
                category={category}
                count={config.counts[category]}
                total={config.total}
                onIncrement={() => handleIncrement(category)}
                onDecrement={() => handleDecrement(category)}
              />
            ))}
          </div>

          {/* Progress Panel */}
          <div className="hidden lg:block">
            <ProgressPanel config={config} onNext={handleNext} />
          </div>
        </div>

        {/* Mobile Progress Panel */}
        <div className="lg:hidden mt-8">
          <ProgressPanel config={config} onNext={handleNext} />
        </div>
      </main>
    </div>
  );
}
