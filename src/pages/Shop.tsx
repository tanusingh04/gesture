import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { Header } from '@/components/Header';
import { ProductCard } from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/lib/i18n';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const categories = ['All', 'Snacks', 'Beverages', 'Dairy', 'Groceries'];

const Shop = () => {
  const { language, sortBy, setSortBy } = useApp();
  const t = useTranslation(language);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryParam = searchParams.get('category') || 'All';

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log('Loading products from API...');
      const data = await api.getProducts();
      console.log('Products loaded:', data.length);
      setProducts(data);
    } catch (error: any) {
      console.error('Error loading products:', error);
      toast.error(error.message || 'Failed to load products. Make sure backend is running on port 3000.');
      // Fallback to empty array
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory = categoryParam === 'All' || product.category === categoryParam;
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'weight') return parseInt(a.weight || '0') - parseInt(b.weight || '0');
    return (b.popularity || 0) - (a.popularity || 0);
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">{t('allProducts')}</h1>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={t('search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-3">
            <Select
              value={categoryParam}
              onValueChange={(val) => setSearchParams({ category: val })}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t('categories')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'All' ? t('allProducts') : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t('sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">{t('popular')}</SelectItem>
                <SelectItem value="price">{t('price')}</SelectItem>
                <SelectItem value="weight">{t('weight')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={categoryParam === cat ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setSearchParams({ category: cat })}
            >
              {cat === 'All' ? t('allProducts') : cat}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">Loading products...</p>
          </div>
        ) : sortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No products found</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Shop;
