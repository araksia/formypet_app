import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Mail, Phone, MapPin, Edit2, Save, X, Bell, Shield, HelpCircle, LogOut, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileData, setProfileData] = useState({
    display_name: '',
    email: '',
    avatar_url: ''
  });
  const [editData, setEditData] = useState(profileData);
  const [stats, setStats] = useState({
    pets: 0,
    events: 0,
    expenses: 0,
    family_members: 0
  });

  useEffect(() => {
    if (user) {
      loadProfileData();
      loadStats();
    }
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading profile:', error);
        toast({
          title: "Σφάλμα",
          description: "Αδυναμία φόρτωσης προφίλ",
          variant: "destructive"
        });
        return;
      }

      if (profile) {
        const profileInfo = {
          display_name: profile.display_name || '',
          email: profile.email || user.email || '',
          avatar_url: profile.avatar_url || ''
        };
        setProfileData(profileInfo);
        setEditData(profileInfo);
      } else {
        // No profile exists, create default values
        const profileInfo = {
          display_name: user.email?.split('@')[0] || '',
          email: user.email || '',
          avatar_url: ''
        };
        setProfileData(profileInfo);
        setEditData(profileInfo);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Σφάλμα",
        description: "Αδυναμία φόρτωσης προφίλ",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user) return;

    try {
      const [petsResult, eventsResult, expensesResult, familyResult] = await Promise.all([
        supabase.from('pets').select('id', { count: 'exact' }).eq('owner_id', user.id),
        supabase.from('events').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('expenses').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('pet_family_members').select('id', { count: 'exact' }).eq('user_id', user.id).eq('status', 'accepted')
      ]);

      setStats({
        pets: petsResult.count || 0,
        events: eventsResult.count || 0,
        expenses: expensesResult.count || 0,
        family_members: familyResult.count || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleEdit = () => {
    setEditData(profileData);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      // Use upsert to insert or update in one operation
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: editData.display_name,
          email: editData.email,
          avatar_url: editData.avatar_url,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving profile:', error);
        throw error;
      }

      setProfileData(editData);
      setIsEditing(false);
      toast({
        title: "Επιτυχής ενημέρωση",
        description: "Το όνομα χρήστη ενημερώθηκε επιτυχώς.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Σφάλμα",
        description: `Αδυναμία αποθήκευσης αλλαγών: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Σφάλμα",
        description: "Η φωτογραφία είναι πολύ μεγάλη. Μέγιστο μέγεθος: 5MB",
        variant: "destructive"
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ επιλέξτε μια φωτογραφία",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      // Delete old avatar if exists
      if (profileData.avatar_url) {
        const oldPath = profileData.avatar_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = data.publicUrl;

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: profileData.display_name,
          email: profileData.email,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (updateError) {
        throw updateError;
      }

      // Update local state
      const updatedProfile = { ...profileData, avatar_url: avatarUrl };
      setProfileData(updatedProfile);
      setEditData(updatedProfile);

      toast({
        title: "Επιτυχία",
        description: "Η φωτογραφία προφίλ ενημερώθηκε επιτυχώς!",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Σφάλμα",
        description: "Αδυναμία ανεβάσματος φωτογραφίας",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const triggerFileInput = () => {
    document.getElementById('avatar-upload')?.click();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <Header title="Προφίλ Χρήστη" />
        <div className="p-4 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Φόρτωση προφίλ...</p>
          </div>
        </div>
      </div>
    );
  }

  const statsData = [
    { label: 'Κατοικίδια', value: stats.pets.toString() },
    { label: 'Γεγονότα', value: stats.events.toString() },
    { label: 'Έξοδα', value: stats.expenses.toString() },
    { label: 'Μέλη Οικογένειας', value: stats.family_members.toString() },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <Header title="Προφίλ Χρήστη" />
      
      <div className="p-4 space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                 <Avatar className="w-24 h-24">
                   <AvatarImage src={profileData.avatar_url} />
                   <AvatarFallback className="text-lg bg-primary/10 text-primary">
                     {getInitials(profileData.display_name || profileData.email)}
                   </AvatarFallback>
                 </Avatar>
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                  onClick={triggerFileInput}
                  disabled={uploading}
                >
                  {uploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
               </div>
              
               {!isEditing ? (
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold">{profileData.display_name || profileData.email}</h1>
                  <Button onClick={handleEdit} className="mt-4">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Επεξεργασία Προφίλ
                  </Button>
                </div>
              ) : (
                <div className="w-full max-w-md space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Όνομα</Label>
                    <Input
                      id="name"
                      value={editData.display_name}
                      onChange={(e) => setEditData(prev => ({ ...prev, display_name: e.target.value }))}
                      onFocus={(e) => {
                        // Enhanced iPhone keyboard handling
                        setTimeout(() => {
                          e.target.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center',
                            inline: 'nearest'
                          });
                        }, 500);
                      }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="flex-1" disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      Αποθήκευση
                    </Button>
                    <Button onClick={handleCancel} variant="outline" className="flex-1">
                      <X className="h-4 w-4 mr-2" />
                      Ακύρωση
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>


        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Στατιστικά</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {statsData.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Ρυθμίσεις</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/settings')}>
              <Bell className="h-4 w-4 mr-2" />
              Ειδοποιήσεις
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/privacy')}>
              <Shield className="h-4 w-4 mr-2" />
              Ιδιωτικότητα
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/terms')}>
              <HelpCircle className="h-4 w-4 mr-2" />
              Όροι & Υποστήριξη
            </Button>
            <Button variant="destructive" className="w-full justify-start" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Αποσύνδεση
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;