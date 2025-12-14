import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Landing from "@/pages/landing";
import Customize from "@/pages/customize";
import CardBack from "@/pages/card-back";
import Preview from "@/pages/preview";
import Checkout from "@/pages/checkout";
import Success from "@/pages/success";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/customize" component={Customize} />
      <Route path="/card-back" component={CardBack} />
      <Route path="/preview" component={Preview} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/success" component={Success} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="deck-builder-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
