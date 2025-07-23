
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ResetPasswordPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ εισάγετε το email σας",
        variant: "destructive"
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ εισάγετε έγκυρο email",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: "Email εστάλη!",
        description: "Ελέγξτε το email σας για οδηγίες επαναφοράς κωδικού",
      });
    } catch (error: any) {
      console.error('Error with password reset:', error);
      toast({
        title: "Σφάλμα",
        description: error.message || "Υπήρξε πρόβλημα με την αποστολή του email",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <img 
              src="/lovable-uploads/e33fce6b-baa6-4fdb-b245-796702e4b22d.png" 
              alt="For my pet logo" 
              className="h-16 w-16 mx-auto"
            />
            <CardTitle className="text-2xl font-bold">Email εστάλη!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <p className="text-muted-foreground">
              Στείλαμε οδηγίες για επαναφορά κωδικού στο email σας: <strong>{email}</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Αν δεν βλέπετε το email, ελέγξτε τον φάκελο spam ή προσπαθήστε ξανά.
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => setEmailSent(false)}
                variant="outline" 
                className="w-full"
              >
                Επαναποστολή email
              </Button>
              <Link to="/login">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Επιστροφή στη σύνδεση
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <img 
            src="/lovable-uploads/e33fce6b-baa6-4fdb-b245-796702e4b22d.png" 
            alt="For my pet logo" 
            className="h-16 w-16 mx-auto"
          />
          <CardTitle className="text-2xl font-bold">Επαναφορά κωδικού</CardTitle>
          <p className="text-muted-foreground">
            Εισάγετε το email σας για να λάβετε οδηγίες επαναφοράς
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12"
            >
              <Mail className="h-4 w-4 mr-2" />
              {loading ? 'Αποστολή...' : 'Αποστολή email επαναφοράς'}
            </Button>
          </form>

          <Link to="/login">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Επιστροφή στη σύνδεση
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
