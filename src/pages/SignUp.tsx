import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/lib/i18n';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

const SignUp = () => {
  const { language, setUser } = useApp();
  const t = useTranslation(language);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      const response = await api.signUp({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      
      localStorage.setItem('token', response.token);
      setUser(response.user);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="bg-card rounded-2xl border border-border shadow-soft p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <img src={logo} alt="GS Grocery Shop" className="h-16 w-16 mx-auto mb-4" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">{t('signUp')}</h1>
            <p className="text-muted-foreground mt-2">Create your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">{t('name')}</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">{t('email')}</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">{t('phone')}</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9935175081 or +919935175081"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">{t('password')}</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button 
              variant="hero" 
              className="w-full mt-6" 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Creating account...' : t('signUp')}
            </Button>
          </form>

          {/* Sign In Link */}
          <p className="text-center mt-6 text-muted-foreground">
            {t('alreadyHaveAccount')}{' '}
            <Link to="/signin" className="text-primary font-semibold hover:underline">
              {t('signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
