import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, DollarSign, AlertTriangle, Plus, Edit, Trash2, QrCode } from 'lucide-react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useApp } from '@/contexts/AppContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const OwnerDashboard = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanning, setScanning] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    weight: '',
    image: '',
    category: 'Snacks',
    barcode: '',
    stock: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'owner') {
      navigate('/');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashboardData, ordersData, productsData] = await Promise.all([
        api.getDashboard(),
        api.getOwnerOrders(),
        api.getProducts()
      ]);
      setDashboard(dashboardData);
      setOrders(ordersData);
      setProducts(productsData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeScan = async () => {
    if (!barcodeInput) {
      toast.error('Please enter or scan a barcode');
      return;
    }

    try {
      setScanning(true);
      let productImage = '';
      let productName = '';
      let productWeight = '';
      let productCategory = 'Snacks';

      // First, always try to construct Open Food Facts image URL from barcode
      // This works even if the product isn't in their database
      if (barcodeInput && barcodeInput.length >= 8) {
        // Ensure barcode is a string and pad to 13 digits for EAN-13 format
        let barcode = String(barcodeInput).trim();
        if (barcode.length < 13) {
          barcode = barcode.padStart(13, '0');
        }
        
        const path1 = barcode.substring(0, 3);
        const path2 = barcode.substring(3, 6);
        const path3 = barcode.substring(6, 9);
        
        // Construct the standard Open Food Facts image URL
        productImage = `https://images.openfoodfacts.org/images/products/${path1}/${path2}/${path3}/${barcode}/front_en.400.jpg`;
        
        console.log('Constructed image URL from barcode:', productImage);
      }

      // Try to fetch product info from Open Food Facts
      try {
        const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcodeInput}.json`);
        const data = await response.json();
        
        if (data.status === 1 && data.product) {
          const product = data.product;
          
          // Try direct API image fields first (these are more reliable)
          if (product.image_url) {
            productImage = product.image_url;
          } else if (product.image_front_url) {
            productImage = product.image_front_url;
          } else if (product.image_front_small_url) {
            productImage = product.image_front_small_url;
          }
          // If no direct image URL, we already have the constructed one above
          
          productName = product.product_name || product.product_name_en || product.abbreviated_product_name || '';
          productWeight = product.quantity || product.product_quantity || '';
          
          // Map Open Food Facts categories to our categories
          const categories = product.categories_tags || [];
          if (categories.some((c: string) => c.includes('beverages') || c.includes('drinks'))) {
            productCategory = 'Beverages';
          } else if (categories.some((c: string) => c.includes('dairy'))) {
            productCategory = 'Dairy';
          } else if (categories.some((c: string) => c.includes('snacks'))) {
            productCategory = 'Snacks';
          }
        }
      } catch (error) {
        console.log('Failed to fetch from Open Food Facts:', error);
      }
      
      // If we still don't have an image, try alternative APIs
      if (!productImage) {
        try {
          // Try UPCitemdb API (free, no key needed)
          const upcResponse = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcodeInput}`);
          const upcData = await upcResponse.json();
          
          if (upcData.code === 'OK' && upcData.items && upcData.items.length > 0) {
            const item = upcData.items[0];
            if (item.images && item.images.length > 0) {
              productImage = item.images[0];
            }
            if (!productName && item.title) {
              productName = item.title;
            }
          }
        } catch (error) {
          console.log('Failed to fetch from UPCitemdb:', error);
        }
      }

      // Try to find existing product in our database
      try {
        const existing = await api.getProductByBarcode(barcodeInput);
        setNewProduct({
          name: existing.name,
          price: existing.price.toString(),
          weight: existing.weight || productWeight,
          image: existing.image || productImage || 'https://via.placeholder.com/400?text=No+Image',
          category: existing.category || productCategory,
          barcode: existing.barcode,
          stock: (existing.stock || 0).toString()
        });
        toast.info('Product found! You can update the details.');
      } catch {
        // Product not found, create new - use fetched data or defaults
        // Always set an image URL - either from API or constructed from barcode
        const finalImage = productImage || 'https://via.placeholder.com/400?text=No+Image';
        
        console.log('Setting product with image:', finalImage);
        console.log('Barcode used:', barcodeInput);
        
        setNewProduct({
          name: productName,
          price: '',
          weight: productWeight,
          image: finalImage,
          category: productCategory,
          barcode: barcodeInput,
          stock: ''
        });
        
        // Show appropriate message based on what was found
        if (productImage && productImage !== 'https://via.placeholder.com/400?text=No+Image' && !productImage.includes('?text=')) {
          toast.success('Product image URL fetched from barcode! Check the preview.');
        } else if (productName) {
          toast.info('Product info found, but no image available. Please add image manually.');
        } else {
          toast.info('New product. Image URL constructed from barcode. Please fill in the details.');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to scan barcode');
    } finally {
      setScanning(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Use barcodeInput if newProduct.barcode is empty
      const barcode = newProduct.barcode || barcodeInput;
      
      if (!barcode) {
        toast.error('Barcode is required');
        return;
      }

      if (!newProduct.name || !newProduct.price) {
        toast.error('Product name and price are required');
        return;
      }

      // Prepare product data with proper types
      const productData = {
        name: newProduct.name,
        price: parseFloat(newProduct.price) || 0,
        weight: newProduct.weight || '',
        image: newProduct.image || 'https://via.placeholder.com/400',
        category: newProduct.category || 'Snacks',
        barcode: barcode,
        stock: parseInt(newProduct.stock) || 0
      };

      // Check if product exists by barcode
      try {
        const existing = await api.getProductByBarcode(barcode);
        // Update existing
        await api.updateProduct(existing.id, productData);
        toast.success('Product updated successfully');
      } catch {
        // Create new
        await api.createProduct(productData);
        toast.success('Product added successfully');
      }
      
      setShowAddProduct(false);
      setNewProduct({
        name: '',
        price: '',
        weight: '',
        image: '',
        category: 'Snacks',
        barcode: '',
        stock: ''
      });
      setBarcodeInput('');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(id);
      toast.success('Product deleted successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.updateOrderStatus(orderId, status);
      toast.success('Order status updated');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">Owner Dashboard</h1>
          <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add/Update Product</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <Label>Barcode *</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Scan or enter barcode"
                      value={barcodeInput}
                      onChange={(e) => {
                        const value = e.target.value;
                        setBarcodeInput(value);
                        setNewProduct({ ...newProduct, barcode: value });
                      }}
                      onBlur={() => {
                        // Auto-fetch image when barcode is entered and field loses focus
                        if (barcodeInput && barcodeInput.length >= 8 && !scanning) {
                          handleBarcodeScan();
                        }
                      }}
                      required
                    />
                    <Button type="button" onClick={handleBarcodeScan} disabled={scanning}>
                      <QrCode className="h-4 w-4 mr-2" />
                      {scanning ? 'Scanning...' : 'Scan/Fetch Image'}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Product Name *</Label>
                  <Input
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Price (₹) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Stock</Label>
                    <Input
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Weight</Label>
                  <Input
                    value={newProduct.weight}
                    onChange={(e) => setNewProduct({ ...newProduct, weight: e.target.value })}
                    placeholder="e.g., 500g, 1kg"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Image URL (Auto-filled from barcode)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newProduct.image}
                      onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                      placeholder="https://... (auto-filled from barcode)"
                    />
                    {newProduct.image && (
                      <div className="w-20 h-20 border rounded overflow-hidden flex-shrink-0 bg-secondary">
                        <img 
                          src={newProduct.image} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Invalid+Image';
                          }}
                          onLoad={() => {
                            console.log('Image loaded successfully:', newProduct.image);
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Image is automatically fetched when you scan/enter barcode. You can also enter a custom URL.
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddProduct(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Product</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        {dashboard && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Orders</p>
                  <p className="text-2xl font-bold">{dashboard.stats.totalOrders}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Pending Orders</p>
                  <p className="text-2xl font-bold">{dashboard.stats.pendingOrders}</p>
                </div>
                <Package className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold">₹{dashboard.stats.totalRevenue.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Low Stock</p>
                  <p className="text-2xl font-bold">{dashboard.stats.lowStockProducts}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </div>
          </div>
        )}

        {/* Orders */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Recent Orders</h2>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 10).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.userId}</TableCell>
                    <TableCell>{order.items.length} items</TableCell>
                    <TableCell>₹{order.total}</TableCell>
                    <TableCell>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className="px-2 py-1 rounded border"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Products */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Products</h2>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Barcode</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.barcode || '-'}</TableCell>
                    <TableCell>₹{product.price}</TableCell>
                    <TableCell>
                      <span className={product.stock < 10 ? 'text-red-500 font-bold' : ''}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setNewProduct({
                            name: product.name,
                            price: product.price.toString(),
                            weight: product.weight,
                            image: product.image,
                            category: product.category,
                            barcode: product.barcode || '',
                            stock: product.stock.toString()
                          });
                          setBarcodeInput(product.barcode || '');
                          setShowAddProduct(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OwnerDashboard;

