
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

import forMyPetLogo from '@/assets/formypet-logo.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate('/');
      }
    };
    checkUser();

    // Load saved email only (security: never store passwords)
    const savedEmail = localStorage.getItem('formypet_email');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
    }
  }, [navigate]);



  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ συμπληρώστε όλα τα πεδία",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Starting email login for:', formData.email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) {
        console.error('Email login error:', error);
        throw error;
      }

      console.log('Email login successful for:', data.user?.email);

      // Save only email for convenience (security: never store passwords)
      localStorage.setItem('formypet_email', formData.email);
      
      // Clean up any previously stored passwords
      localStorage.removeItem('formypet_password');
      localStorage.removeItem('formypet_remember');

      // Wait a moment for auth state to update, then navigate
      setTimeout(() => {
        navigate('/');
      }, 100);
    } catch (error: any) {
      console.error('Error with email login:', error);
      toast({
        title: "Σφάλμα",
        description: error.message || "Υπήρξε πρόβλημα με την σύνδεση",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <img 
            src="/lovable-uploads/cdeb7e37-956e-4df1-a666-ec55f7ac208b.png" 
            alt="For my pet logo" 
            className="h-16 w-16 mx-auto"
          />
          <CardTitle className="text-2xl font-bold">For my pet</CardTitle>
          <p className="text-muted-foreground">Η #1 εφαρμογή για τη φροντίδα των κατοικιδίων στην Ελλάδα</p>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Email Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Κωδικός</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>


            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12"
            >
              <LogIn className="h-4 w-4 mr-2" />
              {loading ? 'Σύνδεση...' : 'Σύνδεση'}
            </Button>
          </form>

          {/* Forgot Password Link */}
          <div className="text-center">
            <Link
              to="/reset-password"
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              Ξέχασα τον κωδικό μου
            </Link>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Δεν έχετε λογαριασμό; </span>
            <Link
              to="/signup"
              className="text-primary underline-offset-4 hover:underline"
            >
              Εγγραφή
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
