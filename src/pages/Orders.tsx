import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, CheckCircle, Truck, Clock, XCircle, RotateCcw } from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/lib/i18n';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const Orders = () => {
  const { language, user } = useApp();
  const t = useTranslation(language);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<any>(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnDescription, setReturnDescription] = useState('');

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getOrders();
      setOrders(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-primary" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-accent" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string, returnStatus?: string) => {
    if (returnStatus === 'pending') {
      return 'bg-yellow-500/10 text-yellow-600';
    }
    if (returnStatus === 'returned' || returnStatus === 'refunded') {
      return 'bg-purple-500/10 text-purple-600';
    }
    switch (status) {
      case 'delivered':
        return 'bg-primary/10 text-primary';
      case 'shipped':
        return 'bg-blue-500/10 text-blue-500';
      case 'processing':
        return 'bg-accent/20 text-accent-foreground';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const isOwner = user?.email === 'tanusng2727@gmail.com' || user?.role === 'owner';

  // Check if order can be cancelled (before delivery)
  const canCancelOrder = (order: any) => {
    if (isOwner) return false;
    return order.status === 'pending' || order.status === 'processing' || order.status === 'shipped';
  };

  // Check if order can be returned/refunded (delivered orders)
  const canReturnOrder = (order: any) => {
    if (isOwner) return false;
    return order.status === 'delivered' && order.returnStatus !== 'returned' && order.returnStatus !== 'refunded';
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      await api.updateOrderStatus(orderId, 'cancelled');
      toast.success('Order cancelled successfully');
      loadOrders();
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel order');
    }
  };

  const handleReturnRefund = async () => {
    if (!returnReason) {
      toast.error('Please select a reason for return/refund');
      return;
    }

    try {
      await api.requestReturnRefund(selectedOrderForReturn.id, returnReason, selectedOrderForReturn.items);
      toast.success('Return/Refund request submitted successfully');
      setReturnDialogOpen(false);
      setReturnReason('');
      setReturnDescription('');
      setSelectedOrderForReturn(null);
      loadOrders();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit return/refund request');
    }
  };

  const openReturnDialog = (order: any) => {
    setSelectedOrderForReturn(order);
    setReturnDialogOpen(true);
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await api.updateOrderStatus(orderId, 'processing');
      toast.success('Order accepted');
      loadOrders();
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept order');
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to reject this order?')) return;
    
    try {
      await api.updateOrderStatus(orderId, 'cancelled');
      toast.success('Order rejected');
      loadOrders();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject order');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">{t('orderHistory')}</h1>
        
        {loading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-card rounded-xl border border-border p-6 shadow-card animate-fade-in"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <h3 className="font-bold text-foreground">{order.id}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('orderDate')}: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    {order.address && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {typeof order.address === 'string' ? order.address : order.address.fullAddress || `${order.address.street}, ${order.address.city} - ${order.address.pincode}`}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status, order.returnStatus)}`}>
                      {order.returnStatus ? `Return: ${order.returnStatus}` : order.status}
                    </span>
                    <span className="text-lg font-bold text-primary">₹{order.total}</span>
                  </div>
                </div>
                
                <div className="border-t border-border pt-4">
                  <div className="space-y-2 mb-4">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="font-medium">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Link to={`/orders/${order.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    {!isOwner && canCancelOrder(order) && (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel Order
                      </Button>
                    )}
                    {!isOwner && canReturnOrder(order) && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => openReturnDialog(order)}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Return/Refund
                      </Button>
                    )}
                    {!isOwner && order.returnStatus && (
                      <div className="text-xs text-muted-foreground text-center pt-1">
                        Return Status: <span className="capitalize">{order.returnStatus}</span>
                      </div>
                    )}
                    {isOwner && order.status === 'pending' && (
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleAcceptOrder(order.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleRejectOrder(order.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">{t('noOrders')}</p>
          </div>
        )}
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
            {selectedOrderForReturn && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Order Items:</p>
                <ul className="list-disc list-inside space-y-1">
                  {selectedOrderForReturn.items.map((item: any, idx: number) => (
                    <li key={idx}>{item.name} × {item.quantity}</li>
                  ))}
                </ul>
                <p className="mt-2 font-medium">Total Amount: ₹{selectedOrderForReturn.total}</p>
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

export default Orders;
