import { useEffect, useState } from "react";
import { Link, useSearch } from "wouter";
import { getDeckState, clearDeckState } from "@/lib/deck-state";
import { CARD_BACK_DESIGNS, formatPrice, DECK_PRICE, type Order } from "@shared/schema";
import { StepIndicator } from "@/components/step-indicator";
import { ThemeToggle } from "@/components/theme-toggle";
import { CelebrationOverlay } from "@/components/celebration-overlay";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Heart,
  CheckCircle2,
  Package,
  Mail,
  Truck,
  Sparkles,
  Loader2,
  XCircle,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import { CardBackPreview } from "@/components/card-back-preview";

export default function Success() {
  const searchString = useSearch();
  const reference = new URLSearchParams(searchString).get("reference");
  
  const [config] = useState(getDeckState);
  const [showCelebration, setShowCelebration] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  
  const selectedDesign = CARD_BACK_DESIGNS.find(
    (d) => d.id === config.cardBackDesign
  );
  const designIndex = config.cardBackIndex ?? 0;

  const verifyPayment = useMutation({
    mutationFn: async (ref: string) => {
      const response = await apiRequest("POST", "/api/verify-payment", { reference: ref });
      return response.json();
    },
    onSuccess: (data: Order) => {
      setOrder(data);
      setShowCelebration(true);
    },
  });

  useEffect(() => {
    if (reference && !order && !verifyPayment.isPending && !verifyPayment.isError) {
      verifyPayment.mutate(reference);
    }
  }, [reference]);

  useEffect(() => {
    if (order) {
      const timer = setTimeout(() => {
        clearDeckState();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [order]);

  const displayPrice = order ? formatPrice(order.totalAmount) : formatPrice(DECK_PRICE);

  if (!reference) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Invalid Payment Reference</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't find your payment details. Please try again or contact support.
          </p>
          <Link href="/checkout">
            <Button data-testid="button-retry-checkout">Return to Checkout</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (verifyPayment.isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Payment Verification Failed</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't verify your payment. If you were charged, please contact support with reference: {reference}
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => verifyPayment.mutate(reference)} data-testid="button-retry-verify">
              Try Again
            </Button>
            <Link href="/">
              <Button variant="outline" data-testid="button-home">Return Home</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CelebrationOverlay 
        show={showCelebration} 
        onComplete={() => setShowCelebration(false)}
        duration={4000}
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
          <StepIndicator currentStep={4} />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-8 relative">
            <div className="mx-auto h-24 w-24 md:h-32 md:w-32 rounded-full bg-primary/10 flex items-center justify-center">
              {verifyPayment.isPending ? (
                <Loader2 className="h-12 w-12 md:h-16 md:w-16 text-primary animate-spin" />
              ) : (
                <CheckCircle2 className="h-12 w-12 md:h-16 md:w-16 text-primary" />
              )}
            </div>
            <Sparkles className="absolute top-0 right-1/3 h-6 w-6 text-yellow-500 animate-pulse" />
            <Sparkles className="absolute bottom-4 left-1/3 h-4 w-4 text-yellow-500 animate-pulse delay-300" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {verifyPayment.isPending ? "Verifying Your Payment..." : "Your Deck is On Its Way!"}
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            {verifyPayment.isPending 
              ? "Please wait while we confirm your payment..."
              : "Thank you for your order. Get ready for deeper conversations!"}
          </p>

          {/* Order Details Card */}
          <Card className="p-6 md:p-8 mb-8 text-left">
            <h2 className="text-lg font-semibold mb-6 text-center">
              {order ? `Order #${order.id.slice(0, 8).toUpperCase()}` : "Order Confirmed"}
            </h2>

            <div className="flex items-center justify-center gap-6 mb-6">
              <CardBackPreview 
                designIndex={designIndex} 
                hue={config.cardBackHue || 0} 
                size="sm"
              />

              <div>
                <p className="font-semibold">Custom Conversation Deck</p>
                <p className="text-sm text-muted-foreground">
                  52 cards • {selectedDesign?.name || "Custom Design"}
                </p>
                <p className="text-lg font-bold mt-2">{displayPrice}</p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-medium mb-4">What Happens Next</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Order Confirmation</p>
                    <p className="text-sm text-muted-foreground">
                      You'll receive an email confirmation with your order details
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Production (1-2 days)</p>
                    <p className="text-sm text-muted-foreground">
                      Your custom deck will be carefully printed and assembled
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Shipping (3-5 days)</p>
                    <p className="text-sm text-muted-foreground">
                      Track your package with the link sent to your email
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/">
              <Button size="lg" data-testid="button-back-home">
                Back to Home
              </Button>
            </Link>
            <Link href="/customize">
              <Button variant="outline" size="lg" data-testid="button-build-another">
                Build Another Deck
              </Button>
            </Link>
          </div>

          {/* Support Note */}
          <p className="mt-8 text-sm text-muted-foreground">
            Questions? Contact us at{" "}
            <a href="mailto:support@deckbuilder.com" className="text-primary hover:underline">
              support@deckbuilder.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
