import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getDeckState, validations } from "@/lib/deck-state";
import { shippingFormSchema, ShippingForm, CARD_BACK_DESIGNS, CATEGORIES, CATEGORY_META, DECK_PRICE, MAX_QUANTITY, formatPrice } from "@shared/schema";
import { StepIndicator } from "@/components/step-indicator";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Heart, ArrowLeft, Lock, CreditCard, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { CardBackPreview } from "@/components/card-back-preview";

const colorMap: Record<string, string> = {
  rose: "bg-rose-500",
  indigo: "bg-indigo-500",
  orange: "bg-orange-500",
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
};

export default function Checkout() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [config, setConfig] = useState(getDeckState);
  const [quantity, setQuantity] = useState(1);

  const subtotal = DECK_PRICE * quantity;
  const total = subtotal;

  const form = useForm<ShippingForm>({
    resolver: zodResolver(shippingFormSchema),
    defaultValues: {
      name: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      country: "Nigeria",
    },
  });

  const createCheckoutSession = useMutation({
    mutationFn: async (data: ShippingForm) => {
      const response = await apiRequest("POST", "/api/create-checkout-session", {
        deckConfig: config,
        quantity,
        shippingName: data.name,
        shippingEmail: data.email,
        shippingAddress: data.address,
        shippingCity: data.city,
        shippingState: data.state,
        shippingZip: data.zip,
        shippingCountry: data.country,
      });
      return response.json();
    },
    onSuccess: (data: { url: string }) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Checkout failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const currentConfig = getDeckState();
    setConfig(currentConfig);

    // Page guard
    if (!validations.canProceedToCheckout(currentConfig)) {
      navigate("/customize");
    }
  }, [navigate]);

  const onSubmit = (data: ShippingForm) => {
    createCheckoutSession.mutate(data);
  };

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
          <StepIndicator currentStep={3} />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Back link */}
        <Link href="/preview">
          <Button variant="ghost" className="gap-2 mb-6" data-testid="button-back-preview">
            <ArrowLeft className="h-4 w-4" />
            Back to Preview
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Checkout</h1>
          <p className="text-muted-foreground">
            Complete your order and we'll ship your custom deck
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
          {/* Shipping Form */}
          <Card className="p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          {...field}
                          data-testid="input-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          {...field}
                          data-testid="input-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123 Main Street"
                          {...field}
                          data-testid="input-address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="New York"
                            {...field}
                            data-testid="input-city"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="NY"
                            {...field}
                            data-testid="input-state"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="zip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="10001"
                            {...field}
                            data-testid="input-zip"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-country">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Nigeria">Nigeria</SelectItem>
                            <SelectItem value="United States">United States</SelectItem>
                            <SelectItem value="Canada">Canada</SelectItem>
                            <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                            <SelectItem value="Australia">Australia</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Payment Section */}
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment
                  </h3>
                  <div className="p-4 rounded-lg bg-muted/50 border text-center">
                    <p className="text-sm text-muted-foreground">
                      You'll be redirected to Stripe to complete your payment securely.
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2"
                  disabled={createCheckoutSession.isPending}
                  data-testid="button-place-order"
                >
                  {createCheckoutSession.isPending ? (
                    "Redirecting to payment..."
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Pay {formatPrice(total)}
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Your payment information is secure and encrypted
                </p>
              </form>
            </Form>
          </Card>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

              <div className="flex gap-4 mb-6">
                <CardBackPreview 
                  designIndex={designIndex} 
                  hue={config.cardBackHue || 0} 
                  size="sm"
                />
                <div className="flex-1">
                  <p className="font-medium">Custom Conversation Deck</p>
                  <p className="text-sm text-muted-foreground">
                    52 cards • {selectedDesign?.name}
                  </p>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center justify-between py-4 border-t border-b mb-4">
                <span className="text-sm font-medium">Quantity</span>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    data-testid="button-quantity-minus"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-semibold" data-testid="text-quantity">
                    {quantity}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(MAX_QUANTITY, quantity + 1))}
                    disabled={quantity >= MAX_QUANTITY}
                    data-testid="button-quantity-plus"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {CATEGORIES.map((category) => {
                  const meta = CATEGORY_META[category];
                  const count = config.counts[category];
                  if (count === 0) return null;
                  return (
                    <div key={category} className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "h-2 w-2 rounded-full",
                            colorMap[meta.color]
                          )}
                        />
                        <span className="text-muted-foreground">{meta.label}</span>
                      </div>
                      <span>{count} cards</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t mt-4 pt-4 space-y-2">
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">
                    {quantity > 1 ? `${quantity} decks × ${formatPrice(DECK_PRICE)}` : "Subtotal"}
                  </span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-primary">Free</span>
                </div>
                <div className="flex justify-between gap-2 font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </Card>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>Secure checkout</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
