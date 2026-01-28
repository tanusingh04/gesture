import { Link } from 'react-router-dom';
import { ShoppingBag, Truck, Shield, Headphones, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { ProductCard } from '@/components/ProductCard';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/lib/i18n';
import { products, categories } from '@/data/products';
import logo from '@/assets/logo.png';

const Index = () => {
  const { language, sortBy } = useApp();
  const t = useTranslation(language);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'weight') return parseInt(a.weight) - parseInt(b.weight);
    return b.popularity - a.popularity;
  });

  const featuredProducts = sortedProducts.slice(0, 4);

  const features = [
    { icon: Truck, title: 'Fast Delivery', desc: 'Same day delivery available' },
    { icon: Shield, title: 'Quality Products', desc: '100% genuine items' },
    { icon: Headphones, title: '24/7 Support', desc: 'Always here to help' },
    { icon: ShoppingBag, title: 'Easy Returns', desc: 'Hassle-free returns' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="gradient-hero py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <div className="flex-1 text-center md:text-left animate-slide-up">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">
                {t('welcome')}
              </h1>
              <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-lg">
                {t('tagline')}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link to="/shop">
                  <Button variant="hero" size="xl">
                    {t('shopNow')}
                  </Button>
                </Link>
                <Link to="/orders">
                  <Button variant="outline" size="xl">
                    {t('orderHistory')}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <img 
                src={logo} 
                alt="GS Grocery Shop" 
                className="w-64 h-64 md:w-80 md:h-80 animate-float drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center text-center p-4 rounded-xl hover:bg-secondary/50 transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">{t('categories')}</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.slice(1).map((category) => (
              <Link
                key={category}
                to={`/shop?category=${category}`}
                className="flex-shrink-0 px-6 py-3 bg-secondary hover:bg-primary hover:text-primary-foreground rounded-full font-medium transition-colors"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">{t('featured')}</h2>
            <Link to="/shop">
              <Button variant="ghost">{t('viewCart')} →</Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-green-dark text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4">
          <img src={logo} alt="GS Grocery Shop" className="h-12 w-12 mx-auto mb-3" />
            <div className="space-y-3 mb-4">
              <p className="text-sm font-medium">Customer Support</p>
              <div className="flex flex-col items-center gap-2">
                <a 
                  href="tel:+919935175081" 
                  className="flex items-center gap-2 text-sm opacity-90 hover:opacity-100 hover:underline transition-opacity"
                >
                  <Phone className="h-4 w-4" />
                  +91 9935175081
                </a>
                <a 
                  href="mailto:tanusng2727@gmail.com" 
                  className="flex items-center gap-2 text-sm opacity-90 hover:opacity-100 hover:underline transition-opacity"
                >
                  <Mail className="h-4 w-4" />
                  tanusng2727@gmail.com
                </a>
              </div>
            </div>
          </div>
          <div className="text-center text-sm opacity-80">
            <p>© 2024 GS Grocery Shop. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
