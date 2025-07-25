import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Stethoscope, Pill, Syringe, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
                <p className="text-muted-foreground">
                  Οι ιατρικές εγγραφές προστίθενται αυτόματα από τα γεγονότα του ημερολογίου
                </p>
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