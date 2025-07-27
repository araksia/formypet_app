import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, TrendingUp, DollarSign, Calendar, Stethoscope, ShoppingCart, Scissors, Pill } from 'lucide-react';

const ExpensesScreenshot = () => {
  const mockExpenses = [
    {
      id: 1,
      date: '12 Μαρ',
      description: 'Εξέταση Ρουτίνας - Μπέλλα',
      category: 'Κτηνίατρος',
      amount: 45.00,
      icon: Stethoscope,
      color: 'bg-blue-500'
    },
    {
      id: 2,
      date: '10 Μαρ',
      description: 'Ξηρά Τροφή Premium',
      category: 'Τροφή',
      amount: 28.50,
      icon: ShoppingCart,
      color: 'bg-green-500'
    },
    {
      id: 3,
      date: '08 Μαρ',
      description: 'Κούρεμα - Ρεξ',
      category: 'Καλλωπισμός',
      amount: 35.00,
      icon: Scissors,
      color: 'bg-purple-500'
    },
    {
      id: 4,
      date: '05 Μαρ',
      description: 'Φάρμακα Αντιπαρασιτικά',
      category: 'Φάρμακα',
      amount: 22.80,
      icon: Pill,
      color: 'bg-orange-500'
    },
    {
      id: 5,
      date: '03 Μαρ',
      description: 'Παιχνίδια & Αξεσουάρ',
      category: 'Αξεσουάρ',
      amount: 15.90,
      icon: ShoppingCart,
      color: 'bg-pink-500'
    }
  ];

  const monthlyStats = {
    total: 147.20,
    budget: 200.00,
    avgPerDay: 4.90
  };

  const categories = [
    { name: 'Κτηνίατρος', amount: 45.00, color: 'bg-blue-500' },
    { name: 'Τροφή', amount: 28.50, color: 'bg-green-500' },
    { name: 'Καλλωπισμός', amount: 35.00, color: 'bg-purple-500' },
    { name: 'Φάρμακα', amount: 22.80, color: 'bg-orange-500' },
    { name: 'Αξεσουάρ', amount: 15.90, color: 'bg-pink-500' }
  ];

  return (
    <div className="w-[375px] h-[812px] bg-gradient-to-br from-green-50 to-blue-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center justify-between">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-gray-900">Έξοδα</h1>
        <Button variant="ghost" size="sm">
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {/* Monthly Summary */}
      <div className="bg-white p-4 border-b">
        <div className="text-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Μάρτιος 2024</h2>
          <div className="flex items-center justify-center mt-2">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-gray-600">Εντός προϋπολογισμού</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-3 w-fit mx-auto mb-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">€{monthlyStats.total}</p>
            <p className="text-xs text-gray-600">Σύνολο</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-3 w-fit mx-auto mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">€{monthlyStats.budget}</p>
            <p className="text-xs text-gray-600">Προϋπολογισμός</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 rounded-full p-3 w-fit mx-auto mb-2">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">€{monthlyStats.avgPerDay}</p>
            <p className="text-xs text-gray-600">Μέσος όρος/ημέρα</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Πρόοδος μήνα</span>
            <span className="font-medium">{Math.round((monthlyStats.total / monthlyStats.budget) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full" 
              style={{ width: `${(monthlyStats.total / monthlyStats.budget) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="flex-1 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Πρόσφατα Έξοδα</h3>
          <Badge variant="secondary" className="bg-blue-100 text-blue-600">
            5 έξοδα
          </Badge>
        </div>

        <div className="space-y-3">
          {mockExpenses.map((expense) => (
            <Card key={expense.id} className="bg-white shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${expense.color} text-white`}>
                      <expense.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{expense.description}</h4>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {expense.date}
                        <Badge variant="outline" className="ml-2 text-xs">
                          {expense.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">€{expense.amount.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Category Breakdown */}
        <Card className="bg-white mt-6">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Ανάλυση ανά Κατηγορία</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-3">
              {categories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                    <span className="text-sm text-gray-600">{category.name}</span>
                  </div>
                  <span className="font-medium text-gray-900">€{category.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Add Expense Button */}
        <Button className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 text-lg font-semibold">
          💰 Προσθήκη Εξόδου
        </Button>
      </div>
    </div>
  );
};

export default ExpensesScreenshot;