import { Plus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  weight: string;
  image: string;
  category: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  weight,
  image,
  category,
}) => {
  const { addToCart, language } = useApp();
  const t = useTranslation(language);

  const handleAddToCart = () => {
    addToCart({ id, name, price, weight, image });
    toast.success(`${name} added to cart!`);
  };

  return (
    <div className="group bg-card rounded-xl border border-border shadow-card hover:shadow-soft transition-all duration-300 overflow-hidden animate-fade-in">
      <div className="relative aspect-square bg-secondary/50 overflow-hidden">
        <img
          src={image || 'https://via.placeholder.com/400?text=No+Image'}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Image+Not+Found';
          }}
        />
        <span className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-xs font-medium px-2 py-1 rounded-full">
          {category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-1">{name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{weight}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-primary">₹{price}</span>
          <Button
            variant="default"
            size="sm"
            onClick={handleAddToCart}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            {t('addToCart')}
          </Button>
        </div>
      </div>
    </div>
  );
};
