import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Palette, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { CARD_BACK_DESIGNS } from "@shared/schema";
import { cn } from "@/lib/utils";
import { RiveCardBack } from "./rive-card-back";

interface CardBackCarouselProps {
  selectedIndex: number | null;
  selectedHue: number;
  onSelect: (index: number, designId: string, hue: number) => void;
}

const baseDesigns = [
  { 
    gradient: "",
    pattern: "",
    accent: "multi",
    baseHue: 0,
    type: "custom" as const,
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

export function CardBackCarousel({ 
  selectedIndex, 
  selectedHue,
  onSelect 
}: CardBackCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(selectedIndex ?? 0);
  const [localHue, setLocalHue] = useState(selectedHue);
  const [isDragging, setIsDragging] = useState(false);
  
  const currentDesign = CARD_BACK_DESIGNS[currentIndex];
  const currentBaseDesign = baseDesigns[currentIndex];
  const isRiveDesign = currentBaseDesign?.type === "rive";
  const isCustomDesign = currentBaseDesign?.type === "custom";
  const isSelected = selectedIndex === currentIndex && (isRiveDesign || selectedHue === localHue);

  useEffect(() => {
    if (selectedIndex !== null && selectedIndex !== currentIndex) {
      setCurrentIndex(selectedIndex);
    }
  }, [selectedIndex]);

  useEffect(() => {
    setLocalHue(selectedHue);
  }, [selectedHue]);

  const navigateTo = (newIndex: number) => {
    setCurrentIndex(newIndex);
    onSelect(newIndex, CARD_BACK_DESIGNS[newIndex].id, localHue);
  };

  const goToPrev = () => {
    const newIndex = currentIndex === 0 ? CARD_BACK_DESIGNS.length - 1 : currentIndex - 1;
    navigateTo(newIndex);
  };

  const goToNext = () => {
    const newIndex = currentIndex === CARD_BACK_DESIGNS.length - 1 ? 0 : currentIndex + 1;
    navigateTo(newIndex);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);
    if (info.offset.x > 100) {
      goToPrev();
    } else if (info.offset.x < -100) {
      goToNext();
    }
  };

  const handleHueChange = (value: number[]) => {
    const newHue = value[0];
    setLocalHue(newHue);
    onSelect(currentIndex, currentDesign.id, newHue);
  };

  const getCardStyle = (offset: number) => {
    const absOffset = Math.abs(offset);
    
    if (absOffset > 2) return { display: "none" };
    
    const xOffset = offset * 120;
    const scale = 1 - absOffset * 0.15;
    const zIndex = 10 - absOffset;
    const rotateY = offset * -15;
    const blur = absOffset * 2;
    const opacity = 1 - absOffset * 0.3;

    return {
      x: xOffset,
      scale,
      zIndex,
      rotateY,
      filter: `blur(${blur}px)`,
      opacity,
    };
  };

  const cardIndices = useMemo(() => {
    const indices = [];
    const totalCards = CARD_BACK_DESIGNS.length;
    const maxOffset = Math.min(2, Math.floor((totalCards - 1) / 2));
    for (let i = -maxOffset; i <= maxOffset; i++) {
      let index = currentIndex + i;
      if (index < 0) index = totalCards + index;
      if (index >= totalCards) index = index - totalCards;
      indices.push({ offset: i, index });
    }
    return indices;
  }, [currentIndex]);

  const getHueRotation = (baseHue: number) => {
    return localHue - baseHue;
  };

  return (
    <div className="space-y-10">
      <div 
        className="relative h-[420px] md:h-[480px] flex items-center justify-center overflow-visible"
        style={{ perspective: "1200px" }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrev}
          className="absolute left-0 md:left-8 z-20 h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm border shadow-lg"
          data-testid="button-carousel-prev"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <div 
          className="relative w-full h-full flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          <AnimatePresence mode="popLayout">
            {cardIndices.map(({ offset, index }) => {
              const design = baseDesigns[index];
              if (!design) return null;
              const cardStyle = getCardStyle(offset);
              const isCurrent = offset === 0;
              const hueRotation = getHueRotation(design.baseHue || 0);

              return (
                <motion.div
                  key={`card-${offset}-${index}`}
                  className="absolute cursor-grab active:cursor-grabbing"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={cardStyle}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 30 
                  }}
                  drag={isCurrent ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={handleDragEnd}
                  onClick={() => !isDragging && offset !== 0 && navigateTo(index)}
                  style={{ transformStyle: "preserve-3d" }}
                  data-testid={`card-3d-${index}`}
                >
                  <div
                    className={cn(
                      "relative w-56 md:w-72 lg:w-80 aspect-[2.5/3.5] rounded-2xl overflow-hidden transition-shadow duration-300",
                      isCurrent && "shadow-2xl shadow-black/30",
                      isCurrent && isSelected && "ring-4 ring-primary ring-offset-2 ring-offset-background"
                    )}
                  >
                    {design.type === "rive" && "riveAssetId" in design ? (
                      <RiveCardBack
                        assetId={design.riveAssetId}
                        className="absolute inset-0"
                      />
                    ) : design.type === "custom" ? (
                      <>
                        <div
                          className="absolute inset-0"
                          style={{
                            background: `linear-gradient(135deg, hsl(${localHue}, 70%, 15%) 0%, hsl(${localHue + 30}, 80%, 25%) 50%, hsl(${localHue + 60}, 70%, 20%) 100%)`
                          }}
                        />
                        <div
                          className="absolute inset-0"
                          style={{
                            background: `radial-gradient(circle at 30% 20%, hsl(${localHue + 20}, 90%, 50%, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 80%, hsl(${localHue + 40}, 90%, 40%, 0.2) 0%, transparent 50%)`
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/5" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative">
                            <div className="h-20 w-20 md:h-24 md:w-24 rounded-full border-2 border-white/30 flex items-center justify-center">
                              <div className="h-12 w-12 md:h-14 md:w-14 rounded-full border border-white/40" />
                            </div>
                            {isCurrent && (
                              <motion.div
                                className="absolute inset-0 rounded-full"
                                initial={{ opacity: 0 }}
                                animate={{ 
                                  opacity: [0.3, 0.6, 0.3],
                                  scale: [1, 1.1, 1]
                                }}
                                transition={{ 
                                  duration: 2, 
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                                style={{
                                  background: `radial-gradient(circle, hsl(${localHue + 20}, 90%, 60%, 0.4) 0%, transparent 70%)`
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </>
                    ) : null}

                    {isCurrent && isSelected && (
                      <motion.div 
                        className="absolute top-4 right-4 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      >
                        <Check className="h-6 w-6" />
                      </motion.div>
                    )}

                    {isCurrent && design.type === "custom" && (
                      <motion.div
                        className="absolute inset-0 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.15) 55%, transparent 60%)",
                          backgroundSize: "200% 100%",
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={goToNext}
          className="absolute right-0 md:right-8 z-20 h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm border shadow-lg"
          data-testid="button-carousel-next"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      <motion.div 
        className="text-center space-y-2"
        key={currentIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-2xl md:text-3xl font-bold">{currentDesign.name}</h3>
        <p className="text-muted-foreground text-lg">{currentDesign.description}</p>
      </motion.div>

      {isCustomDesign && (
        <div className="max-w-md mx-auto space-y-4 p-6 rounded-xl bg-muted/30 border">
          <div className="flex items-center gap-3">
            <Palette className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Customize Color</span>
          </div>
          <div className="relative">
            <div 
              className="absolute inset-0 rounded-full h-3 top-1/2 -translate-y-1/2"
              style={{
                background: "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)"
              }}
            />
            <Slider
              value={[localHue]}
              onValueChange={handleHueChange}
              min={0}
              max={360}
              step={1}
              className="relative z-10 [&_[role=slider]]:h-6 [&_[role=slider]]:w-6 [&_[role=slider]]:border-4 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-lg"
              data-testid="slider-hue"
            />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Drag to shift the color palette
          </p>
        </div>
      )}

      <div className="flex justify-center gap-2 md:gap-3 flex-wrap">
        {CARD_BACK_DESIGNS.map((design, index) => {
          const baseDesign = baseDesigns[index];
          if (!baseDesign) return null;
          const hueRotation = getHueRotation(baseDesign.baseHue || 0);
          const isRive = baseDesign.type === "rive";
          
          return (
            <motion.button
              key={design.id}
              onClick={() => navigateTo(index)}
              className={cn(
                "relative h-14 w-10 md:h-16 md:w-12 rounded-lg overflow-hidden transition-all duration-300",
                "border-2",
                index === currentIndex
                  ? "border-primary scale-110 shadow-lg"
                  : "border-transparent opacity-50 hover:opacity-80"
              )}
              whileHover={{ scale: index === currentIndex ? 1.1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              data-testid={`thumbnail-${index}`}
            >
              {isRive ? (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-purple-600 to-indigo-800"
                >
                  <Sparkles className="h-4 w-4 text-white/70" />
                </div>
              ) : baseDesign?.type === "custom" ? (
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, hsl(${localHue}, 70%, 15%) 0%, hsl(${localHue + 30}, 80%, 25%) 50%, hsl(${localHue + 60}, 70%, 20%) 100%)`
                  }}
                />
              ) : null}
              {selectedIndex === index && (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/30">
                  <Check className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="flex justify-center">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            size="lg"
            onClick={() => {
              onSelect(currentIndex, currentDesign.id, localHue);
            }}
            className={cn(
              "gap-3 px-10 py-6 text-lg font-semibold",
              isSelected && "bg-primary/90"
            )}
            data-testid="button-select-design"
          >
            {isSelected ? (
              <>
                <Check className="h-5 w-5" />
                Design Selected
              </>
            ) : (
              "Select This Design"
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
