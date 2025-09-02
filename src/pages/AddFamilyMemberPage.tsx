import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Users, Mail, UserPlus, Settings, Eye, Edit, UserCheck } from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  species: string;
}

const AddFamilyMemberPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    petId: '',
    role: 'family_member',
    message: '',
    permissions: {
      view: true,
      edit: false,
      invite: false
    }
  });

  useEffect(() => {
    fetchUserPets();
  }, []);

  const fetchUserPets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('Fetching pets for user:', user.id);
      const { data: pets, error } = await supabase
        .from('pets')
        .select('id, name, species')
        .eq('owner_id', user.id);

      console.log('Pets data:', pets, 'Error:', error);
      if (error) throw error;
      setPets(pets || []);
    } catch (error) {
      console.error('Error fetching pets:', error);
      toast({
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η φόρτωση των κατοικίδιων.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.petId) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ συμπληρώστε όλα τα απαιτούμενα πεδία.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Δεν είστε συνδεδεμένος');

      // Get user profile for display name
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .single();

      // Get pet name
      const { data: pet } = await supabase
        .from('pets')
        .select('name')
        .eq('id', formData.petId)
        .single();

      if (!pet) throw new Error('Κατοικίδιο δεν βρέθηκε');

      // Call edge function to send invitation email
      const { data, error } = await supabase.functions.invoke('send-family-invitation', {
        body: {
          invitedEmail: formData.email,
          petId: formData.petId,
          petName: pet.name,
          inviterName: profile?.display_name || user.email || 'Χρήστης',
          role: formData.role,
          message: formData.message
        }
      });

      if (error) throw error;

      toast({
        title: "✅ Επιτυχής αποστολή!",
        description: `Η πρόσκληση στάλθηκε επιτυχώς στο ${formData.email}. Θα λάβουν email με το σύνδεσμο για να δεχθούν την πρόσκληση.`,
      });
      navigate('/');
    } catch (error: any) {

      console.error('Error adding family member:', error);
      toast({
        title: "Σφάλμα",
        description: error.message || "Δεν ήταν δυνατή η προσθήκη του μέλους.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'family_member', label: 'Μέλος Οικογένειας', icon: Users },
    { value: 'caretaker', label: 'Φροντιστής', icon: UserCheck },
    { value: 'viewer', label: 'Παρατηρητής', icon: Eye },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <Header title="Προσθήκη Μέλους Οικογένειας" />
      
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Πρόσκληση Μέλους
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Pet Selection */}
              <div className="space-y-2">
                <Label htmlFor="petId">Κατοικίδιο *</Label>
                <Select value={formData.petId} onValueChange={(value) => setFormData(prev => ({ ...prev, petId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Επιλέξτε κατοικίδιο" />
                  </SelectTrigger>
                  <SelectContent>
                    {pets.map((pet) => (
                      <SelectItem key={pet.id} value={pet.id}>
                        {pet.name} ({pet.species})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role">Ρόλος</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <option.icon className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Permissions */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Δικαιώματα
                </Label>
                
                <div className="space-y-3 pl-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Προβολή στοιχείων</span>
                    </div>
                    <Switch
                      checked={formData.permissions.view}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ 
                          ...prev, 
                          permissions: { ...prev.permissions, view: checked }
                        }))
                      }
                      disabled
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Edit className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Επεξεργασία στοιχείων</span>
                    </div>
                    <Switch
                      checked={formData.permissions.edit}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ 
                          ...prev, 
                          permissions: { ...prev.permissions, edit: checked }
                        }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Πρόσκληση άλλων μελών</span>
                    </div>
                    <Switch
                      checked={formData.permissions.invite}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ 
                          ...prev, 
                          permissions: { ...prev.permissions, invite: checked }
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Προσωπικό μήνυμα (προαιρετικό)</Label>
                <Textarea
                  id="message"
                  placeholder="Γράψτε ένα προσωπικό μήνυμα..."
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Αποστολή...' : 'Αποστολή Πρόσκλησης'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/')} className="flex-1">
                  Ακύρωση
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddFamilyMemberPage;