import React, { useState } from "react";
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
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PieChart as RechartsePieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { format } from "date-fns";
import { el } from "date-fns/locale";

// Mock data για έξοδα
const mockExpenses = [
  {
    id: "1",
    category: "food",
    amount: 45.50,
    petId: "1",
    petName: "Μπάρμπι",
    description: "Royal Canin Adult 15kg",
    date: "2024-01-15",
    receipt: true,
  },
  {
    id: "2",
    category: "vet",
    amount: 85.00,
    petId: "1",
    petName: "Μπάρμπι",
    description: "Εμβόλιο λύσσας + εξέταση",
    date: "2024-01-10",
    receipt: true,
  },
  {
    id: "3",
    category: "medication",
    amount: 25.30,
    petId: "2",
    petName: "Ρεξ",
    description: "Αντιβιοτικό Amoxicillin",
    date: "2024-01-08",
    receipt: false,
  },
  {
    id: "4",
    category: "grooming",
    amount: 35.00,
    petId: "3",
    petName: "Μάξι",
    description: "Κούρεμα + νύχια",
    date: "2024-01-05",
    receipt: true,
  },
  {
    id: "5",
    category: "toys",
    amount: 18.90,
    petId: "1",
    petName: "Μπάρμπι",
    description: "Kong Classic Large",
    date: "2024-01-03",
    receipt: true,
  },
];

const categoryLabels = {
  food: "Φαγητό",
  vet: "Κτηνίατρος",
  medication: "Φάρμακα", 
  grooming: "Grooming",
  toys: "Παιχνίδια",
};

const categoryColors = {
  food: "#8884d8",
  vet: "#82ca9d", 
  medication: "#ffc658",
  grooming: "#ff7c7c",
  toys: "#8dd1e1",
};

const ExpensesPage = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedPet, setSelectedPet] = useState("all");

  // Υπολογισμοί
  const totalExpenses = mockExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyBudget = 200; // Mock budget
  const budgetUsed = (totalExpenses / monthlyBudget) * 100;
  const isOverBudget = totalExpenses > monthlyBudget;

  // Category breakdown για pie chart
  const categoryData = Object.entries(
    mockExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([category, amount]) => ({
    name: categoryLabels[category as keyof typeof categoryLabels],
    value: amount,
    color: categoryColors[category as keyof typeof categoryColors],
  }));

  // Pet comparison data
  const petData = Object.entries(
    mockExpenses.reduce((acc, expense) => {
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
              <SelectItem value="1">Μπάρμπι</SelectItem>
              <SelectItem value="2">Ρεξ</SelectItem>
              <SelectItem value="3">Μάξι</SelectItem>
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
                <div className="text-lg sm:text-xl font-bold">{(totalExpenses / mockExpenses.length).toFixed(0)}€</div>
                <div className="text-xs text-muted-foreground">Μέσος όρος</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-2 sm:p-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <Calendar className="h-4 w-4 text-muted-foreground mb-1 sm:mb-0" />
              <div className="text-left sm:text-right">
                <div className="text-lg sm:text-xl font-bold">{mockExpenses.length}</div>
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
              {mockExpenses.map((expense) => (
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
                        <span className="truncate hidden sm:inline">{categoryLabels[expense.category as keyof typeof categoryLabels]}</span>
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
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExpensesPage;