import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { getDeckState, setCardBack, validations, getDefaultCardBackColors } from "@/lib/deck-state";
import { StepIndicator } from "@/components/step-indicator";
import { CardBackCarousel } from "@/components/card-back-carousel";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft, ChevronRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { CardBackColors } from "@shared/schema";

export default function CardBack() {
  const [, navigate] = useLocation();
  const [config, setConfig] = useState(getDeckState);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    config.cardBackIndex
  );
  const [selectedHue, setSelectedHue] = useState(config.cardBackHue || 0);
  const [selectedColors, setSelectedColors] = useState<CardBackColors | null>(
    config.cardBackColors || null
  );

  useEffect(() => {
    const currentConfig = getDeckState();
    setConfig(currentConfig);
    setSelectedHue(currentConfig.cardBackHue || 0);
    setSelectedColors(currentConfig.cardBackColors || null);

    if (!validations.canProceedToCardBack(currentConfig)) {
      navigate("/customize");
    }
  }, [navigate]);

  const handleSelect = (index: number, designId: string, hue: number, colors?: CardBackColors) => {
    setSelectedIndex(index);
    setSelectedHue(hue);
    if (colors) {
      setSelectedColors(colors);
    }
    const newState = setCardBack(designId, index, hue, colors);
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
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">DeckBuilder</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4">
          <StepIndicator currentStep={1} />
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <Link href="/customize">
          <Button variant="ghost" className="gap-2 mb-6" data-testid="button-back-customize">
            <ArrowLeft className="h-4 w-4" />
            Back to Build
          </Button>
        </Link>

        <motion.div 
          className="mb-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Premium Card Designs
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text">
            Choose Your Card Back
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Select and customize a premium design that matches your style. 
            One design applies to all 52 cards.
          </p>
        </motion.div>

        <motion.div 
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <CardBackCarousel
            selectedIndex={selectedIndex}
            selectedHue={selectedHue}
            selectedColors={selectedColors}
            onSelect={handleSelect}
          />
        </motion.div>

        <motion.div 
          className="flex justify-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button
            size="lg"
            className="gap-2 px-8 py-6 text-lg"
            disabled={!canProceed}
            onClick={handleNext}
            data-testid="button-continue-preview"
          >
            Continue to Preview
            <ChevronRight className="h-5 w-5" />
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
