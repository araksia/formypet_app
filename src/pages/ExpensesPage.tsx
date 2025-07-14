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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Έξοδα Κατοικιδίων</h1>
              <p className="text-muted-foreground">Παρακολούθηση & ανάλυση εξόδων</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button onClick={() => navigate("/add-expense")}>
              <Plus className="h-4 w-4 mr-2" />
              Νέο Έξοδο
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Εβδομάδα</SelectItem>
              <SelectItem value="month">Μήνας</SelectItem>
              <SelectItem value="year">Έτος</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedPet} onValueChange={setSelectedPet}>
            <SelectTrigger className="w-40">
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
            <AlertDescription>
              <strong>Προσοχή!</strong> Έχεις ξεπεράσει τον μηνιαίο προϋπολογισμό κατά {(totalExpenses - monthlyBudget).toFixed(2)}€
            </AlertDescription>
          </Alert>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Συνολικά Έξοδα</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalExpenses.toFixed(2)}€</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% από προηγούμενο μήνα
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Προϋπολογισμός</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{budgetUsed.toFixed(0)}%</div>
              <div className="w-full bg-secondary rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full ${isOverBudget ? 'bg-destructive' : 'bg-primary'}`}
                  style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Μέσος Όρος</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(totalExpenses / mockExpenses.length).toFixed(2)}€</div>
              <p className="text-xs text-muted-foreground">
                ανά έξοδο
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Έξοδα Μήνα</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockExpenses.length}</div>
              <p className="text-xs text-muted-foreground">
                συνολικά έξοδα
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Κατανομή ανά Κατηγορία</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsePieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
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
            <CardHeader>
              <CardTitle>Σύγκριση ανά Κατοικίδιο</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
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

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Μηνιαίες Τάσεις</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrends}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value}€`} />
                  <Bar dataKey="amount" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Πρόσφατα Έξοδα</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockExpenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full" style={{ backgroundColor: `${categoryColors[expense.category as keyof typeof categoryColors]}20` }}>
                      <Euro className="h-4 w-4" style={{ color: categoryColors[expense.category as keyof typeof categoryColors] }} />
                    </div>
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{expense.petName}</span>
                        <span>•</span>
                        <span>{categoryLabels[expense.category as keyof typeof categoryLabels]}</span>
                        <span>•</span>
                        <span>{format(new Date(expense.date), "dd/MM/yyyy", { locale: el })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {expense.receipt && (
                      <Badge variant="secondary" className="text-xs">📄</Badge>
                    )}
                    <span className="font-bold">{expense.amount.toFixed(2)}€</span>
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