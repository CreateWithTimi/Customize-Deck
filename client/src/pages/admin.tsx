import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatPrice, ORDER_STATUSES, type Order, type OrderStatus, CATEGORY_META, type DeckConfig } from "@shared/schema";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Heart,
  Package,
  RefreshCw,
  Eye,
  Loader2,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pending", color: "bg-yellow-500", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-blue-500", icon: CheckCircle },
  processing: { label: "Processing", color: "bg-purple-500", icon: Package },
  shipped: { label: "Shipped", color: "bg-indigo-500", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-500", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-500", icon: XCircle },
};

export default function Admin() {
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusNotes, setStatusNotes] = useState("");

  const { data: orders, isLoading, refetch } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: OrderStatus; notes?: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/orders/${id}/status`, { status, notes });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({ title: "Order status updated" });
      setStatusNotes("");
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateStatus.mutate({ id: orderId, status: newStatus, notes: statusNotes || undefined });
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">DeckBuilder</span>
          </Link>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="gap-2">
              <Package className="h-4 w-4" />
              Admin
            </Badge>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Orders</h1>
            <p className="text-muted-foreground">
              Manage and track all customer orders
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => refetch()} 
            disabled={isLoading}
            data-testid="button-refresh-orders"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !orders || orders.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground">
              Orders will appear here once customers start placing them.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const StatusIcon = statusConfig[order.status as OrderStatus]?.icon || Clock;
              const deckConfig = order.deckConfig as DeckConfig;
              
              return (
                <Card key={order.id} className="p-4 md:p-6" data-testid={`order-card-${order.id}`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <span className="font-mono text-sm font-semibold">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <Badge 
                          className={cn(
                            "gap-1",
                            statusConfig[order.status as OrderStatus]?.color || "bg-gray-500"
                          )}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig[order.status as OrderStatus]?.label || order.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                        <span className="font-medium">{order.shippingName}</span>
                        <span className="text-muted-foreground">{order.shippingEmail}</span>
                        <span className="font-semibold text-primary">
                          {formatPrice(order.totalAmount)} × {order.quantity}
                        </span>
                      </div>
                      
                      <div className="mt-2 text-sm text-muted-foreground">
                        {order.shippingCity}, {order.shippingState}, {order.shippingCountry}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                        disabled={updateStatus.isPending}
                      >
                        <SelectTrigger className="w-[140px]" data-testid={`select-status-${order.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {statusConfig[status]?.label || status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openDetails(order)}
                        data-testid={`button-view-${order.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Order Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Order #{selectedOrder?.id.slice(0, 8).toUpperCase()}
              </DialogTitle>
              <DialogDescription>
                Created {selectedOrder && formatDate(selectedOrder.createdAt)}
              </DialogDescription>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-6">
                {/* Status */}
                <div>
                  <h4 className="font-semibold mb-2">Status</h4>
                  <Badge 
                    className={cn(
                      "gap-1",
                      statusConfig[selectedOrder.status as OrderStatus]?.color || "bg-gray-500"
                    )}
                  >
                    {statusConfig[selectedOrder.status as OrderStatus]?.label || selectedOrder.status}
                  </Badge>
                  {selectedOrder.notes && (
                    <p className="mt-2 text-sm text-muted-foreground">{selectedOrder.notes}</p>
                  )}
                </div>

                {/* Customer Info */}
                <div>
                  <h4 className="font-semibold mb-2">Customer</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="text-muted-foreground">Name:</span> {selectedOrder.shippingName}</p>
                    <p><span className="text-muted-foreground">Email:</span> {selectedOrder.shippingEmail}</p>
                    {selectedOrder.shippingPhone && (
                      <p><span className="text-muted-foreground">Phone:</span> {selectedOrder.shippingPhone}</p>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h4 className="font-semibold mb-2">Shipping Address</h4>
                  <div className="text-sm">
                    <p>{selectedOrder.shippingAddress}</p>
                    <p>{selectedOrder.shippingCity}, {selectedOrder.shippingState} {selectedOrder.shippingZip}</p>
                    <p>{selectedOrder.shippingCountry}</p>
                  </div>
                </div>

                {/* Order Details */}
                <div>
                  <h4 className="font-semibold mb-2">Order Details</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="text-muted-foreground">Quantity:</span> {selectedOrder.quantity} deck(s)</p>
                    <p><span className="text-muted-foreground">Total:</span> {formatPrice(selectedOrder.totalAmount)}</p>
                    {(selectedOrder.deckConfig as DeckConfig)?.cardBackDesign && (
                      <p><span className="text-muted-foreground">Card Back:</span> {(selectedOrder.deckConfig as DeckConfig).cardBackDesign}</p>
                    )}
                  </div>
                </div>

                {/* Deck Configuration */}
                <div>
                  <h4 className="font-semibold mb-2">Card Mix</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {Object.entries((selectedOrder.deckConfig as DeckConfig)?.counts || {}).map(([category, count]) => (
                      <div key={category} className="flex items-center gap-2">
                        <span className="text-muted-foreground capitalize">
                          {CATEGORY_META[category as keyof typeof CATEGORY_META]?.label || category}:
                        </span>
                        <span>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Info */}
                {selectedOrder.stripeSessionId && (
                  <div>
                    <h4 className="font-semibold mb-2">Payment</h4>
                    <div className="text-sm space-y-1">
                      <p><span className="text-muted-foreground">Session:</span> {selectedOrder.stripeSessionId}</p>
                      {selectedOrder.stripePaymentIntentId && (
                        <p><span className="text-muted-foreground">Payment ID:</span> {selectedOrder.stripePaymentIntentId}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Update Status */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Update Status</h4>
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Add a note (optional)"
                      value={statusNotes}
                      onChange={(e) => setStatusNotes(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <div className="flex flex-wrap gap-2">
                      {ORDER_STATUSES.filter(s => s !== selectedOrder.status).map((status) => (
                        <Button
                          key={status}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleStatusChange(selectedOrder.id, status);
                            setDetailsOpen(false);
                          }}
                          disabled={updateStatus.isPending}
                          data-testid={`button-set-${status}`}
                        >
                          {statusConfig[status]?.label || status}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
