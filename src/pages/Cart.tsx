import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, MapPin, Navigation, Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/lib/i18n';
import { api } from '@/lib/api';
import { getCurrentLocation } from '@/lib/geolocation';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Cart = () => {
  const { language, cart, updateQuantity, removeFromCart, user, clearCart } = useApp();
  const navigate = useNavigate();
  const t = useTranslation(language);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validatingAddress, setValidatingAddress] = useState(false);
  const [addressValid, setAddressValid] = useState<boolean | null>(null);
  const [addressDistance, setAddressDistance] = useState<string>('');
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationMethod, setLocationMethod] = useState<'manual' | 'auto'>('manual');

  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  });

  // Payment method is always COD
  const paymentMethod = 'cod';

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const detectLocation = async () => {
    setDetectingLocation(true);
    try {
      toast.info('Requesting location access...');
      
      const location = await getCurrentLocation();
      
      console.log('Detected location:', location);
      
      // Update address with detected location
      const updatedAddress = {
        ...address,
        latitude: location.latitude,
        longitude: location.longitude,
      };
      
      // Only update fields if we got them from geocoding
      if (location.city) updatedAddress.city = location.city;
      if (location.state) updatedAddress.state = location.state;
      if (location.pincode) updatedAddress.pincode = location.pincode;
      if (location.address) {
        // Try to extract street from address
        const addressParts = location.address.split(',');
        if (addressParts.length > 0) {
          updatedAddress.street = addressParts[0].trim();
        }
      }
      
      setAddress(updatedAddress);
      setLocationMethod('auto');
      
      // Automatically validate address after detection
      if (updatedAddress.pincode && updatedAddress.pincode.length === 6) {
        // Wait a bit for state to update, then validate
        setTimeout(async () => {
          try {
            setValidatingAddress(true);
            const validation = await api.validateAddress({
              pincode: updatedAddress.pincode,
              latitude: updatedAddress.latitude,
              longitude: updatedAddress.longitude,
              address: updatedAddress
            });

            if (validation.valid) {
              setAddressValid(true);
              setAddressDistance(validation.distanceKm);
              toast.success(`Location detected and validated! Distance: ${validation.distanceKm}km`);
            } else {
              setAddressValid(false);
              setAddressDistance(validation.distanceKm);
              toast.error(`Location detected but out of range. Distance: ${validation.distanceKm}km (max 5km)`);
            }
          } catch (error: any) {
            toast.error(error.message || 'Failed to validate address');
            setAddressValid(false);
          } finally {
            setValidatingAddress(false);
          }
        }, 500);
      } else if (location.latitude && location.longitude) {
        // Validate with coordinates if no pincode
        setTimeout(async () => {
          try {
            setValidatingAddress(true);
            const validation = await api.validateAddress({
              latitude: updatedAddress.latitude,
              longitude: updatedAddress.longitude,
              address: updatedAddress
            });

            if (validation.valid) {
              setAddressValid(true);
              setAddressDistance(validation.distanceKm);
              toast.success(`Location detected and validated! Distance: ${validation.distanceKm}km`);
            } else {
              setAddressValid(false);
              setAddressDistance(validation.distanceKm);
              toast.error(`Location detected but out of range. Distance: ${validation.distanceKm}km (max 5km)`);
            }
          } catch (error: any) {
            toast.error(error.message || 'Failed to validate address');
            setAddressValid(false);
          } finally {
            setValidatingAddress(false);
          }
        }, 500);
      } else {
        toast.success('Location detected successfully!');
      }
    } catch (error: any) {
      console.error('Location detection error:', error);
      toast.error(error.message || 'Failed to detect location. Please enter address manually.');
      setLocationMethod('manual');
    } finally {
      setDetectingLocation(false);
    }
  };

  const validateAddress = async () => {
    if (!address.pincode || address.pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }

    setValidatingAddress(true);
    try {
      const validation = await api.validateAddress({
        pincode: address.pincode,
        latitude: address.latitude,
        longitude: address.longitude,
        address
      });

      if (validation.valid) {
        setAddressValid(true);
        setAddressDistance(validation.distanceKm);
        toast.success(`Delivery available! Distance: ${validation.distanceKm}km`);
      } else {
        setAddressValid(false);
        setAddressDistance(validation.distanceKm);
        toast.error(`Delivery not available. Distance: ${validation.distanceKm}km (max 5km)`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to validate address');
      setAddressValid(false);
    } finally {
      setValidatingAddress(false);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please sign in to checkout');
      navigate('/signin');
      return;
    }

    if (!addressValid) {
      toast.error('Please validate your address first');
      return;
    }

    if (!address.street || !address.city || !address.pincode) {
      toast.error('Please fill in all required address fields');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        items: cart.map(item => ({
          id: item.id,
          quantity: item.quantity
        })),
        address: {
          ...address,
          fullAddress: `${address.street}, ${address.city}, ${address.state} - ${address.pincode}`,
          latitude: address.latitude,
          longitude: address.longitude
        },
        paymentMethod
      };

      // Cash on delivery only
      const order = await api.createOrder(orderData);
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">{t('cart')}</h1>
        
        {cart.length > 0 ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-card rounded-xl border border-border shadow-card animate-fade-in"
                >
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
                    <p className="text-primary font-bold mt-1">₹{item.price}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Address Form */}
              {showCheckout && (
                <div className="bg-card rounded-xl border border-border p-6 shadow-card mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-bold text-foreground">Delivery Address</h2>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={detectLocation}
                      disabled={detectingLocation}
                      className="flex items-center gap-2"
                    >
                      {detectingLocation ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Detecting...
                        </>
                      ) : (
                        <>
                          <Navigation className="h-4 w-4" />
                          Use Current Location
                        </>
                      )}
                    </Button>
                  </div>

                  {locationMethod === 'auto' && (
                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-sm text-green-700 dark:text-green-300">
                        ✓ Location detected automatically
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Street Address *</Label>
                      <Input
                        value={address.street}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        placeholder="House/Flat No., Building Name"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>City *</Label>
                        <Input
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>State *</Label>
                        <Input
                          value={address.state}
                          onChange={(e) => setAddress({ ...address, state: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label>Pincode *</Label>
                        <Input
                          value={address.pincode}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                            setAddress({ ...address, pincode: value });
                            setAddressValid(null);
                            if (value.length === 6) {
                              setLocationMethod('manual');
                            }
                          }}
                          placeholder="208007"
                          maxLength={6}
                          required
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={validateAddress}
                          disabled={validatingAddress || !address.pincode || address.pincode.length !== 6}
                        >
                          {validatingAddress ? 'Checking...' : 'Validate'}
                        </Button>
                      </div>
                    </div>

                    {addressValid !== null && (
                      <div className={`p-3 rounded-lg ${addressValid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {addressValid ? (
                          <p>✓ Delivery available ({addressDistance}km from base location)</p>
                        ) : (
                          <p>✗ Delivery not available. Distance: {addressDistance}km (We only deliver within 5km of pincode 208007)</p>
                        )}
                      </div>
                    )}

                    <div>
                      <Label>Landmark (Optional)</Label>
                      <Input
                        value={address.landmark}
                        onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                        placeholder="Near..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Info */}
              {showCheckout && (
                <div className="bg-card rounded-xl border border-border p-6 shadow-card mt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground">Payment</h2>
                  </div>
                  <p className="text-muted-foreground">
                    Payment will be collected in cash when your order is delivered.
                  </p>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border border-border p-6 shadow-card sticky top-24">
                <h2 className="text-xl font-bold text-foreground mb-4">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-4 mb-6">
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t('total')}</span>
                    <span className="text-primary">₹{total}</span>
                  </div>
                </div>
                {!showCheckout ? (
                  <Button 
                    variant="hero" 
                    className="w-full"
                    onClick={() => {
                      if (!user) {
                        toast.error('Please sign in to checkout');
                        navigate('/signin');
                        return;
                      }
                      setShowCheckout(true);
                    }}
                  >
                  {t('checkout')}
                </Button>
                ) : (
                  <Button 
                    variant="hero" 
                    className="w-full"
                    onClick={handleCheckout}
                    disabled={loading || !addressValid}
                  >
                    {loading ? 'Processing...' : 'Place Order'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground mb-6">Your cart is empty</p>
            <Link to="/shop">
              <Button variant="default">{t('shopNow')}</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;
