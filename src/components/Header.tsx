import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Settings, Menu, X, Package } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { useTranslation, languages } from '@/lib/i18n';
import logo from '@/assets/logo.png';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const Header = () => {
  const { user, language, setLanguage, cart } = useApp();
  const t = useTranslation(language);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = [
    { to: '/', label: t('home') },
    { to: '/shop', label: t('shop') },
    { to: '/orders', label: t('orders') },
    { to: '/settings', label: t('settings') },
    ...(user?.role === 'owner' ? [{ to: '/owner', label: 'Owner Dashboard' }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logo} alt="GS Grocery Shop" className="h-10 w-10 group-hover:scale-105 transition-transform" />
            <span className="font-bold text-lg text-primary hidden sm:block">GS Grocery</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-secondary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <Select value={language} onValueChange={(val) => setLanguage(val as any)}>
              <SelectTrigger className="w-[100px] h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.nativeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Cart */}
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold h-5 w-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* User */}
            {user ? (
              <Link to="/settings">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link to="/signin">
                <Button variant="default" size="sm">{t('signIn')}</Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border animate-slide-up">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-secondary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};
