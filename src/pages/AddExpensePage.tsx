import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Camera, 
  Upload, 
  X, 
  Euro,
  Calendar,
  FileText,
  Repeat,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const AddExpensePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [expense, setExpense] = useState({
    category: "",
    amount: "",
    petId: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
    isRecurring: false,
    recurringFrequency: "monthly",
  });
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const categories = [
    { value: "food", label: "Φαγητό", icon: "🍖" },
    { value: "vet", label: "Κτηνίατρος", icon: "🏥" },
    { value: "medication", label: "Φάρμακα", icon: "💊" },
    { value: "grooming", label: "Grooming", icon: "✂️" },
    { value: "toys", label: "Παιχνίδια", icon: "🎾" },
    { value: "accessories", label: "Αξεσουάρ", icon: "🦴" },
    { value: "training", label: "Εκπαίδευση", icon: "🎓" },
    { value: "insurance", label: "Ασφάλεια", icon: "🛡️" },
    { value: "other", label: "Άλλο", icon: "📦" },
  ];

  const pets = [
    { id: "1", name: "Μπάρμπι" },
    { id: "2", name: "Ρεξ" },
    { id: "3", name: "Μάξι" },
  ];

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
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
        setReceiptImage(imageData);
        stopCamera();
        processReceipt(imageData);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setReceiptImage(imageData);
        processReceipt(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const processReceipt = (imageData: string) => {
    setIsProcessing(true);
    
    toast({
      title: "Ανάλυση Απόδειξης",
      description: "Εξάγονται πληροφορίες από την απόδειξη...",
    });

    // Προσομοίωση OCR
    setTimeout(() => {
      const mockExtractedData = {
        amount: "45.50",
        description: "Royal Canin Adult 15kg",
        category: "food",
      };
      
      setExpense(prev => ({
        ...prev,
        ...mockExtractedData
      }));
      
      setIsProcessing(false);
      
      toast({
        title: "Επιτυχής Ανάλυση",
        description: "Οι πληροφορίες εξήχθησαν από την απόδειξη",
      });
    }, 2000);
  };

  const handleSubmit = () => {
    if (!expense.category || !expense.amount || !expense.petId || !expense.description) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία",
        variant: "destructive",
      });
      return;
    }

    // Προσομοίωση αποθήκευσης
    toast({
      title: "Επιτυχία",
      description: `Το έξοδο ${expense.amount}€ προστέθηκε επιτυχώς`,
    });

    navigate("/expenses");
  };

  const selectedCategory = categories.find(cat => cat.value === expense.category);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/expenses")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Νέο Έξοδο</h1>
            <p className="text-muted-foreground">Προσθήκη εξόδου κατοικιδίου</p>
          </div>
        </div>

        {/* Receipt Upload/Camera */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Ανάλυση Απόδειξης
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Ανέβασμα</TabsTrigger>
                <TabsTrigger value="camera">Κάμερα</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                  <Label htmlFor="receipt-upload" className="cursor-pointer">
                    <span className="text-primary hover:underline">
                      Κάντε κλικ για επιλογή απόδειξης
                    </span>
                    <Input
                      id="receipt-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </Label>
                </div>
              </TabsContent>
              
              <TabsContent value="camera" className="space-y-4">
                {!isCameraActive && !receiptImage && (
                  <div className="text-center space-y-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-6">
                      <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <Button onClick={startCamera}>
                        Ενεργοποίηση Κάμερας
                      </Button>
                    </div>
                  </div>
                )}
                
                {isCameraActive && (
                  <div className="space-y-4">
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                        <Button
                          onClick={capturePhoto}
                          size="lg"
                          className="rounded-full w-16 h-16"
                        >
                          <Camera className="h-6 w-6" />
                        </Button>
                        <Button
                          onClick={stopCamera}
                          variant="outline"
                          size="lg"
                          className="rounded-full w-16 h-16"
                        >
                          <X className="h-6 w-6" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                <canvas ref={canvasRef} className="hidden" />
              </TabsContent>
            </Tabs>

            {receiptImage && (
              <div className="mt-4">
                <img
                  src={receiptImage}
                  alt="Receipt"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </div>
            )}

            {isProcessing && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Ανάλυση απόδειξης σε εξέλιξη... Παρακαλώ περιμένετε.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Expense Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Euro className="h-5 w-5" />
              Στοιχεία Εξόδου
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Category */}
            <div>
              <Label htmlFor="category">Κατηγορία *</Label>
              <Select value={expense.category} onValueChange={(value) => setExpense({...expense, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Επιλέξτε κατηγορία" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <span className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        {category.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div>
              <Label htmlFor="amount">Ποσό (€) *</Label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={expense.amount}
                  onChange={(e) => setExpense({...expense, amount: e.target.value})}
                  placeholder="0.00"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Pet Selection */}
            <div>
              <Label htmlFor="pet">Κατοικίδιο *</Label>
              <Select value={expense.petId} onValueChange={(value) => setExpense({...expense, petId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Επιλέξτε κατοικίδιο" />
                </SelectTrigger>
                <SelectContent>
                  {pets.map((pet) => (
                    <SelectItem key={pet.id} value={pet.id}>
                      {pet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Περιγραφή *</Label>
              <Textarea
                id="description"
                value={expense.description}
                onChange={(e) => setExpense({...expense, description: e.target.value})}
                placeholder="π.χ. Royal Canin Adult 15kg"
              />
            </div>

            {/* Date */}
            <div>
              <Label htmlFor="date">Ημερομηνία</Label>
              <Input
                id="date"
                type="date"
                value={expense.date}
                onChange={(e) => setExpense({...expense, date: e.target.value})}
              />
            </div>

            {/* Recurring Expense */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Repeat className="h-4 w-4" />
                  Επαναλαμβανόμενο Έξοδο
                </Label>
                <p className="text-sm text-muted-foreground">
                  Αυτόματη προσθήκη του εξόδου κάθε μήνα
                </p>
              </div>
              <Switch
                checked={expense.isRecurring}
                onCheckedChange={(checked) => setExpense({...expense, isRecurring: checked})}
              />
            </div>

            {expense.isRecurring && (
              <div>
                <Label htmlFor="frequency">Συχνότητα</Label>
                <Select value={expense.recurringFrequency} onValueChange={(value) => setExpense({...expense, recurringFrequency: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Εβδομαδιαία</SelectItem>
                    <SelectItem value="monthly">Μηνιαία</SelectItem>
                    <SelectItem value="yearly">Ετήσια</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        {selectedCategory && expense.amount && (
          <Card>
            <CardHeader>
              <CardTitle>Περίληψη</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedCategory.icon}</span>
                  <div>
                    <p className="font-medium">{selectedCategory.label}</p>
                    <p className="text-sm text-muted-foreground">{expense.description || "Χωρίς περιγραφή"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{expense.amount}€</p>
                  {expense.isRecurring && (
                    <p className="text-xs text-muted-foreground">Επαναλαμβανόμενο</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/expenses")}
            className="flex-1"
          >
            Ακύρωση
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1"
          >
            Αποθήκευση Εξόδου
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddExpensePage;