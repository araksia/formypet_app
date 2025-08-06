import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Clock, Users } from 'lucide-react';

interface Invitation {
  id: string;
  invited_email: string;
  pet_id: string;
  role: string;
  message?: string;
  status: string;
  expires_at: string;
  invited_by: string;
  pet?: {
    name: string;
    species: string;
  };
  inviter?: {
    display_name: string;
  };
}

const AcceptInvitationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    fetchInvitation();
  }, [token]);

  const fetchInvitation = async () => {
    try {
      const { data, error } = await supabase
        .from('family_invitations')
        .select(`
          id,
          invited_email,
          pet_id,
          role,
          message,
          status,
          expires_at,
          invited_by
        `)
        .eq('token', token)
        .eq('status', 'pending')
        .single();

      if (error || !data) {
        throw new Error('Πρόσκληση δεν βρέθηκε ή έχει λήξει');
      }

      // Check if invitation has expired
      if (new Date(data.expires_at) < new Date()) {
        throw new Error('Η πρόσκληση έχει λήξει');
      }

      // Fetch pet details
      const { data: pet } = await supabase
        .from('pets')
        .select('name, species')
        .eq('id', data.pet_id)
        .single();

      // Fetch inviter details
      const { data: inviter } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', data.invited_by)
        .single();

      setInvitation({
        ...data,
        pet: pet || { name: 'Άγνωστο', species: 'Άγνωστο' },
        inviter: inviter || { display_name: 'Άγνωστος χρήστης' }
      });
    } catch (error: any) {
      console.error('Error fetching invitation:', error);
      toast({
        title: "Σφάλμα",
        description: error.message || "Δεν ήταν δυνατή η φόρτωση της πρόσκλησης.",
        variant: "destructive",
      });
      setTimeout(() => navigate('/'), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!invitation) return;

    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Απαιτείται σύνδεση",
          description: "Πρέπει να συνδεθείτε για να αποδεχτείτε την πρόσκληση.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      // Check if user is already a family member
      const { data: existingMember } = await supabase
        .from('pet_family_members')
        .select('id')
        .eq('pet_id', invitation.pet_id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        toast({
          title: "Ήδη μέλος",
          description: "Είστε ήδη μέλος της οικογένειας αυτού του κατοικίδιου.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      // Add user as family member
      const { error: memberError } = await supabase
        .from('pet_family_members')
        .insert({
          pet_id: invitation.pet_id,
          user_id: user.id,
          role: invitation.role,
          invited_by: invitation.invited_by,
          status: 'accepted',
          permissions: getDefaultPermissions(invitation.role)
        });

      if (memberError) throw memberError;

      // Update invitation status
      const { error: inviteError } = await supabase
        .from('family_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id);

      if (inviteError) throw inviteError;

      toast({
        title: "Επιτυχία!",
        description: "Αποδεχτήκατε την πρόσκληση και προστεθήκατε στην οικογένεια.",
      });

      navigate('/');
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Σφάλμα",
        description: error.message || "Δεν ήταν δυνατή η αποδοχή της πρόσκλησης.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!invitation) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('family_invitations')
        .update({ status: 'declined' })
        .eq('id', invitation.id);

      if (error) throw error;

      toast({
        title: "Πρόσκληση απορρίφθηκε",
        description: "Η πρόσκληση απορρίφθηκε επιτυχώς.",
      });

      navigate('/');
    } catch (error: any) {
      console.error('Error declining invitation:', error);
      toast({
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η απόρριψη της πρόσκλησης.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const getDefaultPermissions = (role: string) => {
    switch (role) {
      case 'family_member':
        return { view: true, edit: true, invite: true };
      case 'caretaker':
        return { view: true, edit: true, invite: false };
      case 'viewer':
        return { view: true, edit: false, invite: false };
      default:
        return { view: true, edit: false, invite: false };
    }
  };

  const getRoleTranslation = (role: string) => {
    const translations: Record<string, string> = {
      family_member: 'Μέλος Οικογένειας',
      caretaker: 'Φροντιστής',
      viewer: 'Παρατηρητής'
    };
    return translations[role] || role;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Clock className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p>Φόρτωση πρόσκλησης...</p>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Πρόσκληση δεν βρέθηκε</h2>
            <p className="text-muted-foreground">Η πρόσκληση έχει λήξει ή δεν είναι έγκυρη.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Πρόσκληση Οικογένειας</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-lg">
              Προσκληθήκατε να γίνετε <span className="font-semibold text-primary">{getRoleTranslation(invitation.role)}</span>
            </p>
            <p className="text-muted-foreground">
              για το κατοικίδιο <span className="font-semibold">{invitation.pet?.name}</span> ({invitation.pet?.species})
            </p>
            {invitation.inviter?.display_name && (
              <p className="text-sm text-muted-foreground">
                από τον/την {invitation.inviter.display_name}
              </p>
            )}
          </div>

          {invitation.message && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm font-medium mb-1">Προσωπικό μήνυμα:</p>
              <p className="text-sm text-muted-foreground italic">"{invitation.message}"</p>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-medium text-sm">Ως {getRoleTranslation(invitation.role)} θα μπορείτε να:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Προβάλλετε τις πληροφορίες του κατοικίδιου
              </li>
              {(invitation.role === 'family_member' || invitation.role === 'caretaker') && (
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Επεξεργάζεστε στοιχεία και προσθέτετε εγγραφές
                </li>
              )}
              {invitation.role === 'family_member' && (
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Προσκαλείτε άλλα μέλη οικογένειας
                </li>
              )}
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleAccept} 
              disabled={processing}
              className="flex-1"
            >
              {processing ? 'Επεξεργασία...' : 'Αποδοχή'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDecline}
              disabled={processing}
              className="flex-1"
            >
              Απόρριψη
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Η πρόσκληση λήγει στις {new Date(invitation.expires_at).toLocaleDateString('el-GR')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitationPage;