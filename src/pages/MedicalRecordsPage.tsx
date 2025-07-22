import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Camera, Calendar, Stethoscope, Pill, Syringe, FileText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { el } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";


const recordTypeIcons = {
  vaccination: Syringe,
  checkup: Stethoscope,
  medication: Pill,
  surgery: FileText,
  other: FileText,
};

const recordTypeLabels = {
  vaccination: "Εμβόλιο",
  checkup: "Εξέταση",
  medication: "Φάρμακο",
  surgery: "Χειρουργείο",
  other: "Άλλο",
};

const MedicalRecordsPage = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [newRecord, setNewRecord] = useState({
    type: "",
    title: "",
    date: "",
    veterinarian: "",
    description: "",
    notes: "",
  });

  useEffect(() => {
    if (petId && user) {
      fetchMedicalRecords();
    }
  }, [petId, user]);

  const fetchMedicalRecords = async () => {
    if (!petId || !user) return;

    setLoading(true);
    try {
      console.log('🏥 Fetching medical records for pet:', petId);
      
      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('pet_id', petId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Medical records error:', error);
        throw error;
      }

      console.log('🏥 Medical records:', data);
      setRecords(data || []);

    } catch (error: any) {
      console.error('Error fetching medical records:', error);
      toast({
        title: "Σφάλμα",
        description: error.message || "Δεν ήταν δυνατή η φόρτωση των ιατρικών αρχείων",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async () => {
    if (!newRecord.title || !newRecord.date || !newRecord.type) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ συμπληρώστε τα υποχρεωτικά πεδία",
        variant: "destructive",
      });
      return;
    }

    if (!petId || !user) {
      toast({
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η αποθήκευση της εγγραφής",
        variant: "destructive",
      });
      return;
    }

    try {
      const recordData = {
        pet_id: petId,
        user_id: user.id,
        record_type: newRecord.type,
        title: newRecord.title,
        date: newRecord.date,
        veterinarian: newRecord.veterinarian || null,
        description: newRecord.description || null,
        notes: newRecord.notes || null,
      };

      const { data, error } = await supabase
        .from('medical_records')
        .insert(recordData)
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      setRecords([data, ...records]);
      
      // Reset form
      setNewRecord({
        type: "",
        title: "",
        date: "",
        veterinarian: "",
        description: "",
        notes: "",
      });
      
      setIsAddDialogOpen(false);
      
      toast({
        title: "Επιτυχία",
        description: "Η ιατρική εγγραφή προστέθηκε επιτυχώς",
      });

    } catch (error: any) {
      console.error('Error adding medical record:', error);
      toast({
        title: "Σφάλμα",
        description: error.message || "Υπήρξε πρόβλημα κατά την αποθήκευση",
        variant: "destructive",
      });
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Χρήση πίσω κάμερας στο κινητό
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      toast({
        title: "Σφάλμα Κάμερας",
        description: "Δεν ήταν δυνατή η πρόσβαση στην κάμερα",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setCapturedImage(null);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);
        stopCamera();
        
        // Προσομοίωση OCR
        toast({
          title: "Φωτογραφία Αναλύεται",
          description: "Εξάγονται πληροφορίες από το βιβλιάριο...",
        });
        
        setTimeout(() => {
          processImage(imageData);
        }, 2000);
      }
    }
  };

  const processImage = (imageData: string) => {
    // Mock OCR result
    const mockExtractedData = {
      type: "vaccination",
      title: "Εμβόλιο DHPP",
      date: format(new Date(), "yyyy-MM-dd"),
      veterinarian: "Δρ. Παπαδόπουλος",
      description: "Εμβόλιο DHPP (Σκυλολυσσία, Ηπατίτιδα, Παρβοϊός, Παραγρίππη)",
      notes: "Εξάγεται από φωτογραφία βιβλιαρίου",
    };
    
    setNewRecord(mockExtractedData);
    setIsPhotoDialogOpen(false);
    setIsAddDialogOpen(true);
    
    toast({
      title: "Επιτυχής Ανάλυση",
      description: "Οι πληροφορίες εξήχθησαν από τη φωτογραφία",
    });
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        
        toast({
          title: "Φωτογραφία Αναλύεται",
          description: "Εξάγονται πληροφορίες από το βιβλιάριο...",
        });
        
        setTimeout(() => {
          processImage(imageData);
        }, 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderRecordIcon = (type: string) => {
    const IconComponent = recordTypeIcons[type as keyof typeof recordTypeIcons] || FileText;
    return <IconComponent className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/pet/${petId}`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Ιατρικός Φάκελος</h1>
              <p className="text-muted-foreground">Ιατρικό ιστορικό κατοικιδίου</p>
            </div>
          </div>
        </div>

        {/* Medical Records List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <p>Φόρτωση ιατρικών αρχείων...</p>
            </div>
          ) : records.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Stethoscope className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Δεν υπάρχουν ιατρικές εγγραφές</h3>
                <p className="text-muted-foreground mb-4">
                  Προσθέστε την πρώτη ιατρική εγγραφή για το κατοικίδιό σας
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Νέα Εγγραφή
                  </Button>
                  <Button variant="outline" onClick={() => setIsPhotoDialogOpen(true)}>
                    <Camera className="h-4 w-4 mr-2" />
                    Φωτογραφία
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            records.map((record) => (
              <Card key={record.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        {renderRecordIcon(record.record_type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{record.title}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(record.date), "dd/MM/yyyy", { locale: el })}
                          </div>
                          {record.veterinarian && (
                            <div className="flex items-center gap-1">
                              <Stethoscope className="h-4 w-4" />
                              {record.veterinarian}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-secondary">
                      {recordTypeLabels[record.record_type as keyof typeof recordTypeLabels]}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {record.description && (
                    <p className="text-sm mb-2">{record.description}</p>
                  )}
                  {record.notes && (
                    <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                      <strong>Σημειώσεις:</strong> {record.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordsPage;