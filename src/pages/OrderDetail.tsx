import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, DollarSign, TrendingUp, Box, XCircle, CheckCircle, RotateCcw } from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useApp();
  const [order, setOrder] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnDescription, setReturnDescription] = useState('');

  useEffect(() => {
    if (user && id) {
      loadOrderDetail();
      loadProducts();
    }
  }, [user, id]);

  const loadOrderDetail = async () => {
    try {
      const data = await api.getOrder(id!);
      setOrder(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (error: any) {
      console.error('Failed to load products:', error);
    }
  };

  const calculateProfit = (productId: string, quantity: number, sellingPrice: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return { profit: 0, cost: 0, margin: 0 };
    
    // Assume cost is 70% of selling price (30% profit margin)
    // You can adjust this based on your actual cost structure
    const costPerUnit = sellingPrice * 0.7;
    const totalCost = costPerUnit * quantity;
    const totalRevenue = sellingPrice * quantity;
    const profit = totalRevenue - totalCost;
    const margin = (profit / totalRevenue) * 100;
    
    return {
      profit: profit.toFixed(2),
      cost: totalCost.toFixed(2),
      margin: margin.toFixed(1),
      stock: product.stock || 0
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Order not found</div>
        </div>
      </div>
    );
  }

  const totalProfit = order.items.reduce((sum: number, item: any) => {
    const profitData = calculateProfit(item.id, item.quantity, item.price);
    return sum + parseFloat(profitData.profit);
  }, 0);

  const isOwner = user?.email === 'tanusng2727@gmail.com' || user?.role === 'owner';
  const canCancel = !isOwner && (order.status === 'pending' || order.status === 'processing' || order.status === 'shipped');
  const canReturn = !isOwner && order.status === 'delivered' && order.returnStatus !== 'returned' && order.returnStatus !== 'refunded';
  const canAccept = isOwner && order.status === 'pending';
  const canReject = isOwner && order.status === 'pending';

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      await api.updateOrderStatus(order.id, 'cancelled');
      toast.success('Order cancelled successfully');
      loadOrderDetail();
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel order');
    }
  };

  const handleAcceptOrder = async () => {
    try {
      await api.updateOrderStatus(order.id, 'processing');
      toast.success('Order accepted');
      loadOrderDetail();
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept order');
    }
  };

  const handleRejectOrder = async () => {
    if (!confirm('Are you sure you want to reject this order?')) return;
    
    try {
      await api.updateOrderStatus(order.id, 'cancelled');
      toast.success('Order rejected');
      loadOrderDetail();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject order');
    }
  };

  const handleReturnRefund = async () => {
    if (!returnReason) {
      toast.error('Please select a reason for return/refund');
      return;
    }

    try {
      await api.requestReturnRefund(order.id, returnReason, order.items);
      toast.success('Return/Refund request submitted successfully');
      setReturnDialogOpen(false);
      setReturnReason('');
      setReturnDescription('');
      loadOrderDetail();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit return/refund request');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/orders')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Order Details</h1>
              <p className="text-muted-foreground mt-1">Order ID: {order.id}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">₹{order.total}</p>
              <p className="text-sm text-muted-foreground">Total Amount</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Order Items with Profit Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card rounded-xl border border-border p-6 shadow-card">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </h2>
              
              <div className="space-y-4">
                {order.items.map((item: any, index: number) => {
                  const profitData = calculateProfit(item.id, item.quantity, item.price);
                  const product = products.find(p => p.id === item.id);
                  
                  return (
                    <div key={index} className="border-b border-border pb-4 last:border-0">
                      <div className="flex items-start gap-4">
                        <img
                          src={item.image || 'https://via.placeholder.com/400?text=No+Image'}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Image+Not+Found';
                          }}
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.weight}</p>
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Quantity:</span>
                              <span className="font-medium">{item.quantity}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Price per unit:</span>
                              <span className="font-medium">₹{item.price}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Subtotal:</span>
                              <span className="font-medium">₹{item.price * item.quantity}</span>
                            </div>
                            {isOwner && product && (
                              <div className="flex justify-between text-sm mt-2 pt-2 border-t border-border">
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <Box className="h-3 w-3" />
                                  Stock Available:
                                </span>
                                <span className={`font-medium ${parseInt(profitData.stock) < 10 ? 'text-red-500' : 'text-green-500'}`}>
                                  {profitData.stock} units
                                </span>
                              </div>
                            )}
                            {isOwner && (
                              <>
                                <div className="flex justify-between text-sm pt-2 border-t border-border">
                                  <span className="text-muted-foreground flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    Cost:
                                  </span>
                                  <span className="font-medium">₹{profitData.cost}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                    Profit:
                                  </span>
                                  <span className="font-medium text-green-500">₹{profitData.profit}</span>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>Profit Margin:</span>
                                  <span>{profitData.margin}%</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-6 shadow-card sticky top-24">
              <h2 className="text-xl font-bold text-foreground mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order ID:</span>
                  <span className="font-medium">{order.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium capitalize">
                    {order.returnStatus ? `Return: ${order.returnStatus}` : order.status}
                  </span>
                </div>
                {order.returnStatus && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Return Reason:</span>
                    <span className="font-medium capitalize">{order.returnReason || 'N/A'}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment:</span>
                  <span className="font-medium capitalize">{order.paymentMethod || 'COD'}</span>
                </div>
              </div>

              {order.address && (
                <div className="border-t border-border pt-4 mb-4">
                  <h3 className="font-semibold text-foreground mb-2">Delivery Address</h3>
                  <p className="text-sm text-muted-foreground">
                    {typeof order.address === 'string' 
                      ? order.address 
                      : order.address.fullAddress || `${order.address.street}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}`}
                  </p>
                </div>
              )}

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-bold">₹{order.total}</span>
                </div>
                {isOwner && (
                  <>
                    <div className="flex justify-between text-green-500">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Total Profit:
                      </span>
                      <span className="font-bold">₹{totalProfit.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground pt-2">
                      Profit margin: {((totalProfit / order.total) * 100).toFixed(1)}%
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="border-t border-border pt-4 mt-4 space-y-2">
                {canCancel && (
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={handleCancelOrder}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Order
                  </Button>
                )}
                {canReturn && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setReturnDialogOpen(true)}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Request Return/Refund
                  </Button>
                )}
                {order.returnStatus && (
                  <div className="text-sm text-muted-foreground text-center pt-1">
                    Return Status: <span className="capitalize font-medium">{order.returnStatus}</span>
                  </div>
                )}
                {canAccept && (
                  <Button 
                    variant="default" 
                    className="w-full"
                    onClick={handleAcceptOrder}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept Order
                  </Button>
                )}
                {canReject && (
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={handleRejectOrder}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Order
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Return/Refund Dialog */}
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Return/Refund</DialogTitle>
            <DialogDescription>
              Please select the reason for return/refund. We'll process your request within 24-48 hours.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Return/Refund *</Label>
              <Select value={returnReason} onValueChange={setReturnReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="broken">Product is Broken/Damaged</SelectItem>
                  <SelectItem value="spoiled">Product is Spoiled</SelectItem>
                  <SelectItem value="expired">Product is Expired</SelectItem>
                  <SelectItem value="wrong_item">Wrong Item Delivered</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Additional Details (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Please provide more details about the issue..."
                value={returnDescription}
                onChange={(e) => setReturnDescription(e.target.value)}
                rows={3}
              />
            </div>
            {order && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Order Items:</p>
                <ul className="list-disc list-inside space-y-1">
                  {order.items.map((item: any, idx: number) => (
                    <li key={idx}>{item.name} × {item.quantity}</li>
                  ))}
                </ul>
                <p className="mt-2 font-medium">Total Amount: ₹{order.total}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReturnRefund} disabled={!returnReason}>
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderDetail;

