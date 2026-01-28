import { User, Bell, Globe, SlidersHorizontal, Mail, Phone, Save, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useApp } from '@/contexts/AppContext';
import { useTranslation, languages } from '@/lib/i18n';
import { toast } from 'sonner';

const Settings = () => {
  const {
    language,
    setLanguage,
    sortBy,
    setSortBy,
    emailNotifications,
    setEmailNotifications,
    smsNotifications,
    setSmsNotifications,
    user,
    setUser,
    clearCart,
  } = useApp();
  const navigate = useNavigate();
  const t = useTranslation(language);

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  const handleLogout = () => {
    // Clear user data
    setUser(null);
    clearCart();
    localStorage.removeItem('token');
    localStorage.removeItem('cart');
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">{t('settings')}</h1>
        
        <div className="space-y-6">
          {/* Profile Section */}
          <section className="bg-card rounded-xl border border-border p-6 shadow-card animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{t('profile')}</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">{t('name')}</Label>
                <Input
                  id="name"
                  defaultValue={user?.name || ''}
                  placeholder="Enter your full name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={user?.email || ''}
                  placeholder="Enter your email"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">{t('phone')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  defaultValue={user?.phone || ''}
                  placeholder="+91 XXXXX XXXXX"
                  className="mt-1"
                />
              </div>
            </div>
          </section>

          {/* Sorting Preferences */}
          <section className="bg-card rounded-xl border border-border p-6 shadow-card animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <SlidersHorizontal className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{t('sortBy')}</h2>
            </div>
            <div>
              <Label htmlFor="sort">Default sort preference</Label>
              <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">{t('popular')}</SelectItem>
                  <SelectItem value="price">{t('price')}</SelectItem>
                  <SelectItem value="weight">{t('weight')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>

          {/* Language */}
          <section className="bg-card rounded-xl border border-border p-6 shadow-card animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{t('language')}</h2>
            </div>
            <div>
              <Label htmlFor="language">Select your preferred language</Label>
              <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.nativeName} ({lang.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          {/* Notifications */}
          <section className="bg-card rounded-xl border border-border p-6 shadow-card animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{t('notifications')}</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{t('emailNotifications')}</p>
                    <p className="text-sm text-muted-foreground">Receive order updates via email</p>
                  </div>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{t('smsNotifications')}</p>
                    <p className="text-sm text-muted-foreground">Receive SMS for delivery updates</p>
                  </div>
                </div>
                <Switch
                  checked={smsNotifications}
                  onCheckedChange={setSmsNotifications}
                />
              </div>
            </div>
          </section>

          {/* Save Button */}
          <Button variant="hero" className="w-full" onClick={handleSave}>
            <Save className="h-5 w-5 mr-2" />
            {t('saveChanges')}
          </Button>

          {/* Logout Button */}
          {user && (
            <Button 
              variant="destructive" 
              className="w-full" 
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Log Out
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default Settings;
