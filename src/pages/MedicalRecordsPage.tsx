import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Camera, Calendar, Stethoscope, Pill, Syringe, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { el } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

// Mock data για ιατρικές εγγραφές
const mockMedicalRecords = [
  {
    id: "1",
    type: "vaccination",
    title: "Εμβόλιο Λύσσας",
    date: "2024-01-15",
    veterinarian: "Δρ. Παπαδόπουλος",
    description: "Ετήσιο εμβόλιο λύσσας - Επόμενη δόση: 15/01/2025",
    notes: "Καμία αντίδραση",
  },
  {
    id: "2", 
    type: "checkup",
    title: "Γενικός Έλεγχος",
    date: "2023-12-10",
    veterinarian: "Δρ. Γεωργίου",
    description: "Τακτικός έλεγχος υγείας - Όλα φυσιολογικά",
    notes: "Βάρος: 25kg, Πίεση: φυσιολογική",
  },
  {
    id: "3",
    type: "medication",
    title: "Αντιβιοτική Αγωγή",
    date: "2023-11-22",
    veterinarian: "Δρ. Κωνσταντίνου",
    description: "Amoxicillin 500mg - 2 φορές την ημέρα για 7 ημέρες",
    notes: "Για λοίμωξη αυτιού",
  },
];

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
  const [records, setRecords] = useState(mockMedicalRecords);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({
    type: "",
    title: "",
    date: "",
    veterinarian: "",
    description: "",
    notes: "",
  });

  const handleAddRecord = () => {
    if (!newRecord.title || !newRecord.date || !newRecord.type) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ συμπληρώστε τα υποχρεωτικά πεδία",
        variant: "destructive",
      });
      return;
    }

    const record = {
      id: Date.now().toString(),
      ...newRecord,
    };

    setRecords([record, ...records]);
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
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Εδώ θα προσθέταμε OCR functionality
      toast({
        title: "Φωτογραφία Αναλύεται",
        description: "Εξάγονται πληροφορίες από το βιβλιάριο...",
      });
      
      // Mock OCR result
      setTimeout(() => {
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
      }, 2000);
    }
  };

  const renderRecordIcon = (type: string) => {
    const IconComponent = recordTypeIcons[type as keyof typeof recordTypeIcons] || FileText;
    return <IconComponent className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-background p-4">
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
          
          <div className="flex gap-2">
            <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Φωτογραφία Βιβλιαρίου
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Φωτογραφία Βιβλιαρίου</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Ανεβάστε φωτογραφία από το βιβλιάριο υγείας για αυτόματη εξαγωγή πληροφοριών
                  </p>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                    <Label htmlFor="photo-upload" className="cursor-pointer">
                      <span className="text-primary hover:underline">
                        Κάντε κλικ για επιλογή φωτογραφίας
                      </span>
                      <Input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                    </Label>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Νέα Εγγραφή
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Νέα Ιατρική Εγγραφή</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="record-type">Τύπος Εγγραφής *</Label>
                    <Select value={newRecord.type} onValueChange={(value) => setNewRecord({...newRecord, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Επιλέξτε τύπο" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(recordTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="record-title">Τίτλος *</Label>
                    <Input
                      id="record-title"
                      value={newRecord.title}
                      onChange={(e) => setNewRecord({...newRecord, title: e.target.value})}
                      placeholder="π.χ. Εμβόλιο Λύσσας"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="record-date">Ημερομηνία *</Label>
                    <Input
                      id="record-date"
                      type="date"
                      value={newRecord.date}
                      onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="record-vet">Κτηνίατρος</Label>
                    <Input
                      id="record-vet"
                      value={newRecord.veterinarian}
                      onChange={(e) => setNewRecord({...newRecord, veterinarian: e.target.value})}
                      placeholder="π.χ. Δρ. Παπαδόπουλος"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="record-description">Περιγραφή</Label>
                    <Textarea
                      id="record-description"
                      value={newRecord.description}
                      onChange={(e) => setNewRecord({...newRecord, description: e.target.value})}
                      placeholder="Περιγραφή της ιατρικής πράξης..."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="record-notes">Σημειώσεις</Label>
                    <Textarea
                      id="record-notes"
                      value={newRecord.notes}
                      onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})}
                      placeholder="Επιπλέον σημειώσεις..."
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                      Ακύρωση
                    </Button>
                    <Button onClick={handleAddRecord} className="flex-1">
                      Προσθήκη
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Medical Records List */}
        <div className="space-y-4">
          {records.length === 0 ? (
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
                        {renderRecordIcon(record.type)}
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
                      {recordTypeLabels[record.type as keyof typeof recordTypeLabels]}
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