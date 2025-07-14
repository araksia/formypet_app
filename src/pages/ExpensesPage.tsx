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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-4 overflow-hidden">
      <div className="max-w-7xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Έξοδα Κατοικιδίων</h1>
              <p className="text-sm text-muted-foreground">Παρακολούθηση & ανάλυση εξόδων</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => navigate("/add-expense")} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Νέο Έξοδο
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Εβδομάδα</SelectItem>
              <SelectItem value="month">Μήνας</SelectItem>
              <SelectItem value="year">Έτος</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedPet} onValueChange={setSelectedPet}>
            <SelectTrigger className="w-36">
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
          <Alert className="border-destructive mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Προσοχή!</strong> Έχεις ξεπεράσει τον μηνιαίο προϋπολογισμό κατά {(totalExpenses - monthlyBudget).toFixed(2)}€
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content - Two Column Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
          
          {/* Left Column - Overview & Charts */}
          <div className="lg:col-span-2 space-y-4 min-h-0 flex flex-col">
            
            {/* Overview Cards */}
            <div className="grid grid-cols-4 gap-3">
              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <Euro className="h-4 w-4 text-muted-foreground" />
                  <div className="text-right">
                    <div className="text-lg font-bold">{totalExpenses.toFixed(0)}€</div>
                    <div className="text-xs text-muted-foreground">Συνολικά</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <PieChart className="h-4 w-4 text-muted-foreground" />
                  <div className="text-right">
                    <div className="text-lg font-bold">{budgetUsed.toFixed(0)}%</div>
                    <div className="text-xs text-muted-foreground">Προϋπολογισμός</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <div className="text-right">
                    <div className="text-lg font-bold">{(totalExpenses / mockExpenses.length).toFixed(0)}€</div>
                    <div className="text-xs text-muted-foreground">Μέσος όρος</div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="text-right">
                    <div className="text-lg font-bold">{mockExpenses.length}</div>
                    <div className="text-xs text-muted-foreground">Έξοδα</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
              {/* Category Breakdown */}
              <Card className="flex flex-col min-h-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Κατανομή ανά Κατηγορία</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 min-h-0">
                  <div className="h-full min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsePieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
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
              <Card className="flex flex-col min-h-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Σύγκριση ανά Κατοικίδιο</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 min-h-0">
                  <div className="h-full min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={petData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value}€`} />
                        <Bar dataKey="amount" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Recent Expenses */}
          <div className="flex flex-col min-h-0">
            <Card className="flex-1 min-h-0 flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Πρόσφατα Έξοδα</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 overflow-y-auto">
                <div className="space-y-2">
                  {mockExpenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="p-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: `${categoryColors[expense.category as keyof typeof categoryColors]}20` }}>
                          <Euro className="h-3 w-3" style={{ color: categoryColors[expense.category as keyof typeof categoryColors] }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{expense.description}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span className="truncate">{expense.petName}</span>
                            <span>•</span>
                            <span className="truncate">{categoryLabels[expense.category as keyof typeof categoryLabels]}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {expense.receipt && (
                          <Badge variant="secondary" className="text-xs p-0.5">📄</Badge>
                        )}
                        <span className="font-bold text-sm">{expense.amount.toFixed(0)}€</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;