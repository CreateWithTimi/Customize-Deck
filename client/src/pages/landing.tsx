import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { RiveInstance, RiveManager } from "@/lib/rive-runtime";
import {
  Heart,
  MessageCircle,
  Shuffle,
  Package,
  Star,
  ChevronRight,
  Sparkles,
  Shield,
  Clock,
} from "lucide-react";

function HeroCardDeck() {
  const [isRiveLoaded, setIsRiveLoaded] = useState(false);
  const riveRef = useRef<RiveInstance | null>(null);

  useEffect(() => {
    const hero = new RiveInstance({
      canvasId: "hero-rive-canvas",
      rivePath: "/ui.riv",
      artboardName: "Hero",
      stateMachineName: "HeroState",
    });

    hero.init().then((success) => {
      if (success) {
        setIsRiveLoaded(true);
        riveRef.current = hero;
        RiveManager.register("hero", hero);
      }
    });

    return () => {
      hero.dispose();
      riveRef.current = null;
    };
  }, []);

  const handleMouseEnter = () => {
    riveRef.current?.setBoolean("isHover", true);
  };

  const handleMouseLeave = () => {
    riveRef.current?.setBoolean("isHover", false);
  };

  return (
    <div 
      className="relative w-full max-w-xl mx-auto h-[400px] md:h-[500px] lg:h-[550px]" 
      data-testid="hero-card-deck"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glow effect behind animation */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-primary/5 to-transparent rounded-3xl blur-3xl" />
      
      {/* Rive canvas */}
      <canvas
        id="hero-rive-canvas"
        className="relative z-10 w-full h-full cursor-pointer"
        aria-label="Interactive card deck animation"
      />
    </div>
  );
}

export default function Landing() {
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

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto relative px-4 py-16 md:py-24">
          <div className="grid lg:grid-cols-[1.3fr_1fr] gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
            {/* Left: Text content */}
            <div className="text-center lg:text-left space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>New: 5 Category Themes Available</span>
              </div>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Build Your Perfect
                <span className="block text-primary">Conversation Deck</span>
              </h1>

              <p className="max-w-xl text-lg md:text-xl text-muted-foreground lg:pr-8">
                Create a customized 52-card deck tailored to your relationship.
                Choose your mix of romantic, deep, playful, and more —
                delivered to your door.
              </p>

              <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4">
                <Link href="/customize">
                  <Button size="lg" className="gap-2 text-lg px-8" data-testid="button-start-building">
                    Start Building
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="gap-2" data-testid="button-learn-more">
                  Learn More
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4" />
                  <span>Premium Quality</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>Ships in 3-5 Days</span>
                </div>
              </div>
            </div>

            {/* Right: Card deck visual centerpiece */}
            <div className="order-first lg:order-last">
              <HeroCardDeck />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              Why Choose Custom Decks?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every relationship is unique. Your conversation cards should be too.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            <Card className="p-8 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                <Heart className="h-6 w-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="text-xl font-semibold">Personalized Mix</h3>
              <p className="text-muted-foreground">
                Choose exactly how many cards from each category — romantic, deep, playful, and more.
              </p>
            </Card>

            <Card className="p-8 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold">Curated Questions</h3>
              <p className="text-muted-foreground">
                Every question is carefully crafted to spark meaningful conversations and deeper connection.
              </p>
            </Card>

            <Card className="p-8 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Shuffle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold">Perfect Balance</h3>
              <p className="text-muted-foreground">
                Mix lighthearted fun with profound depth. Your deck, your rules.
              </p>
            </Card>

            <Card className="p-8 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <Package className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="text-xl font-semibold">Premium Quality</h3>
              <p className="text-muted-foreground">
                Thick, luxurious cards with your choice of five stunning card back designs.
              </p>
            </Card>

            <Card className="p-8 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Star className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold">5 Categories</h3>
              <p className="text-muted-foreground">
                Romantic, Deep, Naughty, Friendship, and Playful — find the perfect blend.
              </p>
            </Card>

            <Card className="p-8 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold">Gamified Builder</h3>
              <p className="text-muted-foreground">
                Our intuitive deck builder makes customization fun and satisfying.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Build your custom deck in just a few simple steps
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {[
              {
                step: 1,
                title: "Build Your Mix",
                description: "Choose how many cards from each category to create your perfect 52-card deck.",
              },
              {
                step: 2,
                title: "Pick Card Back",
                description: "Select from five premium card back designs to match your style.",
              },
              {
                step: 3,
                title: "Preview & Order",
                description: "Review your selections and complete your order securely.",
              },
              {
                step: 4,
                title: "Enjoy Together",
                description: "Receive your custom deck and start meaningful conversations.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-4">
                <div className="mx-auto h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              Loved by Couples
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See what others are saying about their custom decks
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {[
              {
                quote: "We've been together for 10 years and still discovered new things about each other. These cards are magic.",
                name: "Sarah & Mike",
                relationship: "Married 10 years",
              },
              {
                quote: "Perfect for date nights! We love the mix of deep questions and playful ones. Highly recommend.",
                name: "Jessica & Tom",
                relationship: "Dating 2 years",
              },
              {
                quote: "The quality is amazing and being able to customize the mix made it so personal to us.",
                name: "Alex & Jordan",
                relationship: "Engaged",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="p-6 space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.relationship}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              Ready to Spark Deeper Connections?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Create your custom conversation deck today and transform your
              quality time together.
            </p>
            <div className="pt-4">
              <Link href="/customize">
                <Button size="lg" className="gap-2 text-lg px-8" data-testid="button-cta-start">
                  Build Your Deck
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <span className="font-semibold">DeckBuilder</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Made with love for meaningful connections
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
