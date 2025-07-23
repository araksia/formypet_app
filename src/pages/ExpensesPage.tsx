import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Euro, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  PieChart,
  BarChart3,
  AlertTriangle,
  Download,
  ArrowLeft,
  Edit2,
  Check,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PieChart as RechartsePieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { format } from "date-fns";
import { el } from "date-fns/locale";
import { supabase } from '@/integrations/supabase/client';

// Type definitions
type Expense = {
  id: string;
  category: string;
  amount: number;
  petId: string;
  petName: string;
  description: string;
  date: string;
  receipt: boolean;
};

const categoryLabels = {
  food: "Φαγητό",
  vet: "Κτηνίατρος",
  medication: "Φάρμακα", 
  grooming: "Grooming",
  toys: "Παιχνίδια",
  accessories: "Αξεσουάρ",
  training: "Εκπαίδευση",
  insurance: "Ασφάλεια",
  other: "Άλλο"
};

const categoryColors = {
  food: "#8884d8",
  vet: "#82ca9d", 
  medication: "#ffc658",
  grooming: "#ff7c7c",
  toys: "#8dd1e1",
  accessories: "#d084d0",
  training: "#ffb347",
  insurance: "#87ceeb",
  other: "#dda0dd"
};

const ExpensesPage = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedPet, setSelectedPet] = useState("all");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch expenses and pets data
      const [expensesData, petsData] = await Promise.all([
        supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)
          .order('expense_date', { ascending: false }),
        supabase
          .from('pets')
          .select('id, name')
          .eq('owner_id', user.id)
      ]);

      if (expensesData.error) throw expensesData.error;
      if (petsData.error) throw petsData.error;

      // Create a map of pet ids to names
      const petNamesMap = new Map();
      petsData.data?.forEach(pet => {
        petNamesMap.set(pet.id, pet.name);
      });

      // Format expenses data
      const formattedExpenses: Expense[] = (expensesData.data || []).map(expense => ({
        id: expense.id,
        category: expense.category,
        amount: expense.amount,
        petId: expense.pet_id,
        petName: petNamesMap.get(expense.pet_id) || 'Άγνωστο',
        description: expense.description,
        date: expense.expense_date,
        receipt: !!expense.receipt_url
      }));

      setExpenses(formattedExpenses);
      setPets(petsData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Υπολογισμοί
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const [monthlyBudget, setMonthlyBudget] = useState(100);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(monthlyBudget.toString());
  
  const handleBudgetSave = () => {
    const newBudget = parseFloat(budgetInput);
    if (!isNaN(newBudget) && newBudget > 0) {
      setMonthlyBudget(newBudget);
      setIsEditingBudget(false);
    }
  };

  const handleBudgetCancel = () => {
    setBudgetInput(monthlyBudget.toString());
    setIsEditingBudget(false);
  };
  const budgetUsed = (totalExpenses / monthlyBudget) * 100;
  const isOverBudget = totalExpenses > monthlyBudget;

  // Category breakdown για pie chart
  const categoryData = Object.entries(
    expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([category, amount]) => ({
    name: categoryLabels[category as keyof typeof categoryLabels] || category,
    value: amount,
    color: categoryColors[category as keyof typeof categoryColors] || "#999999",
  }));

  // Pet comparison data
  const petData = Object.entries(
    expenses.reduce((acc, expense) => {
      acc[expense.petName] = (acc[expense.petName] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([petName, amount]) => ({
    name: petName,
    amount: amount,
  }));

  // Monthly trends (mock data)
  const monthlyTrends = [
    { month: "Οκτ", amount: 180 },
    { month: "Νοε", amount: 220 },
    { month: "Δεκ", amount: 195 },
    { month: "Ιαν", amount: totalExpenses },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-2 sm:p-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex justify-center items-center h-32">
            <p>Φόρτωση εξόδων...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold">Έξοδα Κατοικιδίων</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Παρακολούθηση & ανάλυση εξόδων</p>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button onClick={() => navigate("/add-expense")} size="sm">
              <Plus className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Νέο </span>Έξοδο
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Εβδομάδα</SelectItem>
              <SelectItem value="month">Μήνας</SelectItem>
              <SelectItem value="year">Έτος</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedPet} onValueChange={setSelectedPet}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Όλα τα κατοικίδια</SelectItem>
              {pets.map((pet) => (
                <SelectItem key={pet.id} value={pet.id}>
                  {pet.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Budget Alert */}
        {isOverBudget && (
          <Alert className="border-destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Προσοχή!</strong> Έχεις ξεπεράσει τον μηνιαίο προϋπολογισμό κατά {(totalExpenses - monthlyBudget).toFixed(2)}€
            </AlertDescription>
          </Alert>
        )}
        {/* Budget Card */}
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-sm sm:text-base flex items-center justify-between">
              <span>Μηνιαίος Προυπολογισμός</span>
              {!isEditingBudget && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingBudget(true)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  {isEditingBudget ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={budgetInput}
                        onChange={(e) => setBudgetInput(e.target.value)}
                        className="w-24"
                        step="0.01"
                      />
                      <span className="text-sm">€</span>
                      <Button size="sm" onClick={handleBudgetSave}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleBudgetCancel}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold">{monthlyBudget}€</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">{totalExpenses.toFixed(2)}€</div>
                  <div className="text-sm text-muted-foreground">Έξοδα αυτόν τον μήνα</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Χρήση προυπολογισμού</span>
                  <span>{budgetUsed.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      isOverBudget ? 'bg-destructive' : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                  />
                </div>
                {isOverBudget && (
                  <div className="text-sm text-destructive">
                    Υπέρβαση κατά {(totalExpenses - monthlyBudget).toFixed(2)}€
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <Card className="p-2 sm:p-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <Euro className="h-4 w-4 text-muted-foreground mb-1 sm:mb-0" />
              <div className="text-left sm:text-right">
                <div className="text-lg sm:text-xl font-bold">{totalExpenses.toFixed(0)}€</div>
                <div className="text-xs text-muted-foreground">Συνολικά</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-2 sm:p-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <PieChart className="h-4 w-4 text-muted-foreground mb-1 sm:mb-0" />
              <div className="text-left sm:text-right">
                <div className="text-lg sm:text-xl font-bold">{budgetUsed.toFixed(0)}%</div>
                <div className="text-xs text-muted-foreground">Προϋπολογισμός</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-2 sm:p-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <BarChart3 className="h-4 w-4 text-muted-foreground mb-1 sm:mb-0" />
              <div className="text-left sm:text-right">
                <div className="text-lg sm:text-xl font-bold">{(expenses.length > 0 ? totalExpenses / expenses.length : 0).toFixed(0)}€</div>
                <div className="text-xs text-muted-foreground">Μέσος όρος</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-2 sm:p-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <Calendar className="h-4 w-4 text-muted-foreground mb-1 sm:mb-0" />
              <div className="text-left sm:text-right">
                <div className="text-lg sm:text-xl font-bold">{expenses.length}</div>
                <div className="text-xs text-muted-foreground">Έξοδα</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Category Breakdown */}
          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-sm sm:text-base">Κατανομή ανά Κατηγορία</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsePieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius="70%"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}€`} />
                  </RechartsePieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Pet Comparison */}
          <Card>
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="text-sm sm:text-base">Σύγκριση ανά Κατοικίδιο</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={petData}>
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(value) => `${value}€`} />
                    <Bar dataKey="amount" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Expenses */}
        <Card>
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-sm sm:text-base">Πρόσφατα Έξοδα</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
              {expenses.length > 0 ? expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-md">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="p-1 sm:p-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: `${categoryColors[expense.category as keyof typeof categoryColors]}20` }}>
                      <Euro className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: categoryColors[expense.category as keyof typeof categoryColors] }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-xs sm:text-sm truncate">{expense.description}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="truncate">{expense.petName}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="truncate hidden sm:inline">{categoryLabels[expense.category as keyof typeof categoryLabels] || expense.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {expense.receipt && (
                      <Badge variant="secondary" className="text-xs p-0.5 hidden sm:inline">📄</Badge>
                    )}
                    <span className="font-bold text-xs sm:text-sm">{expense.amount.toFixed(0)}€</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Δεν υπάρχουν έξοδα ακόμα</p>
                  <p className="text-sm">Προσθέστε το πρώτο σας έξοδο!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExpensesPage;