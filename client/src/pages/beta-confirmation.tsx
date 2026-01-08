import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { DeckSummary, clearDeckState } from "@/lib/deck-state";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, CheckCircle2, MessageCircle, Clock, CreditCard, Truck, ArrowRight } from "lucide-react";

export default function BetaConfirmation() {
  const [, navigate] = useLocation();
  const [summary, setSummary] = useState<DeckSummary | null>(null);

  useEffect(() => {
    // Retrieve order summary from session storage
    const stored = sessionStorage.getItem("betaOrderSummary");
    if (!stored) {
      navigate("/");
      return;
    }

    try {
      const parsed = JSON.parse(stored) as DeckSummary;
      setSummary(parsed);
    } catch {
      navigate("/");
    }
  }, [navigate]);

  const handleStartNew = () => {
    // Clear deck state and session storage
    clearDeckState();
    sessionStorage.removeItem("betaOrderSummary");
    navigate("/");
  };

  if (!summary) {
    return null;
  }

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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-3">
              You're Almost There!
            </h1>
            <p className="text-muted-foreground text-lg">
              Your custom deck order has been prepared. Complete it via WhatsApp.
            </p>
          </div>

          {/* Order Summary Card */}
          <Card className="p-6 mb-8">
            <h2 className="font-semibold text-lg mb-4">Your Order Summary</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Deck ID</span>
                <span className="font-mono font-medium">{summary.deckId}</span>
              </div>
              
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Total Cards</span>
                <span>{summary.totalCards} cards per deck</span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Card Back</span>
                <span>
                  {summary.cardBackDesign}
                  {summary.cardBackHue !== null && ` (Hue: ${summary.cardBackHue})`}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Quantity</span>
                <span>{summary.quantity} {summary.quantity > 1 ? "decks" : "deck"}</span>
              </div>

              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Categories</span>
                  <div className="text-right">
                    {summary.categories.map((cat, i) => (
                      <div key={i}>
                        {cat.name}: {cat.count}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t pt-3 mt-3">
                {summary.quantity > 1 && (
                  <div className="flex justify-between gap-4 text-muted-foreground mb-1">
                    <span>Price per deck</span>
                    <span>{summary.formattedPricePerDeck}</span>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <span className="font-semibold">Total Price</span>
                  <span className="font-bold text-lg">{summary.formattedTotalPrice}</span>
                </div>
                <div className="flex justify-between gap-4 text-muted-foreground">
                  <span>Estimated Delivery</span>
                  <span>{summary.estimatedDelivery}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Next Steps */}
          <Card className="p-6 mb-8 bg-muted/30">
            <h2 className="font-semibold text-lg mb-4">What Happens Next?</h2>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">1. Send Your WhatsApp Message</p>
                  <p className="text-sm text-muted-foreground">
                    A new WhatsApp chat should have opened with your order details. 
                    Just hit send to start the conversation.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">2. Quick Response</p>
                  <p className="text-sm text-muted-foreground">
                    I'll respond within a few hours to confirm your order and answer any questions.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">3. Easy Payment</p>
                  <p className="text-sm text-muted-foreground">
                    I'll share payment details via WhatsApp. Bank transfer or card accepted.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">4. Fast Delivery</p>
                  <p className="text-sm text-muted-foreground">
                    Your custom deck will be printed and shipped within 5-7 business days.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Didn't Open WhatsApp? */}
          <Card className="p-6 mb-8 border-dashed">
            <p className="text-sm text-muted-foreground mb-3">
              Didn't see WhatsApp open? No worries, you can still reach out:
            </p>
            <a 
              href={`https://wa.me/2348165429119`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button variant="outline" className="gap-2" data-testid="button-open-whatsapp">
                <MessageCircle className="h-4 w-4" />
                Open WhatsApp Chat
              </Button>
            </a>
            <p className="text-xs text-muted-foreground mt-3">
              Reference your Deck ID: <span className="font-mono font-medium">{summary.deckId}</span>
            </p>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" onClick={handleStartNew} data-testid="button-start-new">
              Build Another Deck
            </Button>
            <Link href="/">
              <Button className="gap-2" data-testid="button-go-home">
                Back to Home
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
