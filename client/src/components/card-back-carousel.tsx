import { useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CARD_BACK_DESIGNS } from "@shared/schema";
import { cn } from "@/lib/utils";

interface CardBackCarouselProps {
  selectedIndex: number | null;
  onSelect: (index: number, designId: string) => void;
}

const designColors = [
  "from-gray-900 via-gray-800 to-gray-900", // midnight-noir
  "from-rose-300 via-pink-200 to-rose-300", // rose-garden
  "from-indigo-900 via-blue-800 to-indigo-900", // celestial
  "from-gray-100 via-white to-gray-100", // classic-marble
  "from-red-700 via-red-600 to-red-700", // passion-red
];

const designPatterns = [
  "bg-[radial-gradient(circle_at_30%_20%,rgba(255,215,0,0.3)_0%,transparent_50%)]", // gold foil
  "bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.4)_0%,transparent_70%)]", // floral
  "bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.2)_0%,transparent_40%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.2)_0%,transparent_40%)]", // stars
  "bg-[linear-gradient(45deg,rgba(212,175,55,0.2)_0%,transparent_50%,rgba(212,175,55,0.2)_100%)]", // marble veins
  "bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15)_0%,transparent_60%)]", // hearts
];

export function CardBackCarousel({ selectedIndex, onSelect }: CardBackCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(selectedIndex ?? 0);
  const currentDesign = CARD_BACK_DESIGNS[currentIndex];

  const goToPrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? CARD_BACK_DESIGNS.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) =>
      prev === CARD_BACK_DESIGNS.length - 1 ? 0 : prev + 1
    );
  };

  const isSelected = selectedIndex === currentIndex;

  return (
    <div className="space-y-8">
      {/* Main carousel */}
      <div className="relative flex items-center justify-center gap-4 md:gap-8">
        <Button
          variant="outline"
          size="icon"
          onClick={goToPrev}
          className="h-10 w-10 md:h-12 md:w-12 rounded-full shrink-0"
          data-testid="button-carousel-prev"
        >
          <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
        </Button>

        <div className="relative">
          {/* Card preview */}
          <div
            className={cn(
              "relative aspect-[2.5/3.5] w-48 md:w-64 lg:w-72 rounded-xl overflow-hidden shadow-2xl transition-all duration-500",
              "border-4",
              isSelected ? "border-primary ring-4 ring-primary/20" : "border-transparent"
            )}
            data-testid={`card-back-preview-${currentIndex}`}
          >
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br",
                designColors[currentIndex]
              )}
            />
            <div
              className={cn(
                "absolute inset-0",
                designPatterns[currentIndex]
              )}
            />
            
            {/* Center decoration */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 md:h-20 md:w-20 rounded-full border-2 border-white/20 flex items-center justify-center">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full border border-white/30" />
              </div>
            </div>

            {/* Selected indicator */}
            {isSelected && (
              <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <Check className="h-5 w-5" />
              </div>
            )}
          </div>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={goToNext}
          className="h-10 w-10 md:h-12 md:w-12 rounded-full shrink-0"
          data-testid="button-carousel-next"
        >
          <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
        </Button>
      </div>

      {/* Design info */}
      <div className="text-center space-y-2">
        <h3 className="text-xl md:text-2xl font-semibold">{currentDesign.name}</h3>
        <p className="text-muted-foreground">{currentDesign.description}</p>
      </div>

      {/* Thumbnail navigation */}
      <div className="flex justify-center gap-3 flex-wrap">
        {CARD_BACK_DESIGNS.map((design, index) => (
          <button
            key={design.id}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "relative h-16 w-12 md:h-20 md:w-14 rounded-lg overflow-hidden transition-all duration-300",
              "border-2",
              index === currentIndex
                ? "border-primary ring-2 ring-primary/20 scale-110"
                : "border-transparent opacity-60 hover:opacity-100"
            )}
            data-testid={`thumbnail-${index}`}
          >
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br",
                designColors[index]
              )}
            />
            <div
              className={cn(
                "absolute inset-0",
                designPatterns[index]
              )}
            />
            {selectedIndex === index && (
              <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                <Check className="h-4 w-4 text-primary" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Select button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={() => onSelect(currentIndex, currentDesign.id)}
          className={cn(
            "gap-2 min-w-48",
            isSelected && "bg-primary/80"
          )}
          data-testid="button-select-design"
        >
          {isSelected ? (
            <>
              <Check className="h-4 w-4" />
              Selected
            </>
          ) : (
            "Select This Design"
          )}
        </Button>
      </div>
    </div>
  );
}
