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
  X,
  Trash2
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
import { ExpenseItemSkeleton, StatsCardSkeleton, ExpenseChartSkeleton } from '@/components/ui/skeletons';
import { VirtualList } from '@/components/ui/VirtualList';
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
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

  const handleDeleteExpense = async (expenseId: string, description: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;

      // Update local state by removing the deleted expense
      setExpenses(prev => prev.filter(expense => expense.id !== expenseId));

      toast({
        title: "Επιτυχία!",
        description: `Το έξοδο "${description}" διαγράφηκε επιτυχώς`,
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Σφάλμα",
        description: "Υπήρξε πρόβλημα κατά τη διαγραφή του εξόδου",
        variant: "destructive"
      });
    }
  };

  // Φιλτράρισμα εξόδων
  const filteredExpenses = React.useMemo(() => {
    let filtered = [...expenses];
    
    // Φίλτρο κατοικιδίου
    if (selectedPet !== "all") {
      filtered = filtered.filter(expense => expense.petId === selectedPet);
    }
    
    // Φίλτρο χρονικής περιόδου
    const now = new Date();
    
    if (selectedPeriod === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(expense => new Date(expense.date) >= weekAgo);
    } else if (selectedPeriod === "month") {
      const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
      filtered = filtered.filter(expense => new Date(expense.date) >= monthAgo);
    } else if (selectedPeriod === "year") {
      const yearAgo = new Date(now.getFullYear(), 0, 1);
      filtered = filtered.filter(expense => new Date(expense.date) >= yearAgo);
    }
    
    return filtered;
  }, [expenses, selectedPet, selectedPeriod]);

  // Υπολογισμοί βασισμένοι στα φιλτραρισμένα έξοδα
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
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

  // Category breakdown για pie chart (φιλτραρισμένα δεδομένα)
  const categoryData = Object.entries(
    filteredExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([category, amount]) => ({
    name: categoryLabels[category as keyof typeof categoryLabels] || category,
    value: amount,
    color: categoryColors[category as keyof typeof categoryColors] || "#999999",
  }));

  // Pet comparison data (φιλτραρισμένα δεδομένα)
  const petData = Object.entries(
    filteredExpenses.reduce((acc, expense) => {
      acc[expense.petName] = (acc[expense.petName] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([petName, amount]) => ({
    name: petName,
    amount: amount,
  }));

  // Calculate actual monthly trends from expenses data
  const monthlyTrends = React.useMemo(() => {
    const months = ["Οκτ", "Νοε", "Δεκ", "Ιαν"];
    return months.map((month, index) => {
      // For now, show only current month data
      if (index === months.length - 1) {
        return { month, amount: totalExpenses };
      }
      return { month, amount: 0 };
    });
  }, [totalExpenses]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-2 sm:p-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {[1, 2, 3, 4].map((i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>
          <ExpenseChartSkeleton />
          <div className="space-y-2 sm:space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <ExpenseItemSkeleton key={i} />
            ))}
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
          <Card className="p-2 sm:p-3 card-hover stagger-fade">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <Euro className="h-4 w-4 text-muted-foreground mb-1 sm:mb-0" />
              <div className="text-left sm:text-right">
                <div className="text-lg sm:text-xl font-bold">{totalExpenses.toFixed(0)}€</div>
                <div className="text-xs text-muted-foreground">Συνολικά</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-2 sm:p-3 card-hover stagger-fade" style={{ animationDelay: '0.1s' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <PieChart className="h-4 w-4 text-muted-foreground mb-1 sm:mb-0" />
              <div className="text-left sm:text-right">
                <div className="text-lg sm:text-xl font-bold">{budgetUsed.toFixed(0)}%</div>
                <div className="text-xs text-muted-foreground">Προϋπολογισμός</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-2 sm:p-3 card-hover stagger-fade" style={{ animationDelay: '0.2s' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <BarChart3 className="h-4 w-4 text-muted-foreground mb-1 sm:mb-0" />
              <div className="text-left sm:text-right">
                <div className="text-lg sm:text-xl font-bold">{(filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0).toFixed(0)}€</div>
                <div className="text-xs text-muted-foreground">Μέσος όρος</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-2 sm:p-3 card-hover stagger-fade" style={{ animationDelay: '0.3s' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <Calendar className="h-4 w-4 text-muted-foreground mb-1 sm:mb-0" />
              <div className="text-left sm:text-right">
                <div className="text-lg sm:text-xl font-bold">{filteredExpenses.length}</div>
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
            <CardTitle className="text-sm sm:text-base">Λίστα Εξόδων</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredExpenses.length > 0 ? (
              <VirtualList
                items={filteredExpenses}
                itemHeight={60}
                containerHeight={256}
                className="space-y-2 sm:space-y-3"
                gap={8}
                renderItem={(expense, index, isVisible) => (
                  <div 
                    className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-md card-hover stagger-fade"
                    style={{ 
                      animationDelay: `${index * 0.05}s`,
                      opacity: isVisible ? 1 : 0.5,
                      transition: 'opacity 0.3s ease'
                    }}
                  >
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
                      <span className="font-bold text-xs sm:text-sm mr-2">{expense.amount.toFixed(0)}€</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteExpense(expense.id, expense.description)}
                        className="p-1 h-6 w-6 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Δεν υπάρχουν έξοδα ακόμα</p>
                <p className="text-sm">Προσθέστε το πρώτο σας έξοδο!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExpensesPage;