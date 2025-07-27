import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Plus, Stethoscope, Pill, Syringe, Calendar, FileText, Heart, Download } from 'lucide-react';

const MedicalRecordsScreenshot = () => {
  const mockRecords = [
    {
      id: 1,
      date: '15 Μαρ 2024',
      type: 'Εξέταση',
      title: 'Γενική Εξέταση Υγείας',
      veterinarian: 'Δρ. Σπύρος Παπαδόπουλος',
      petName: 'Μπέλλα',
      petEmoji: '🐕',
      diagnosis: 'Άριστη υγεία',
      icon: Stethoscope,
      color: 'bg-blue-500',
      status: 'completed'
    },
    {
      id: 2,
      date: '10 Μαρ 2024',
      type: 'Εμβολιασμός',
      title: 'Ετήσιος Εμβολιασμός',
      veterinarian: 'Δρ. Μαρία Νικολάου',
      petName: 'Ρεξ',
      petEmoji: '🐕',
      diagnosis: 'Εμβόλια ολοκληρώθηκαν',
      icon: Syringe,
      color: 'bg-green-500',
      status: 'completed'
    },
    {
      id: 3,
      date: '05 Μαρ 2024',
      type: 'Φάρμακα',
      title: 'Αντιπαρασιτικά',
      veterinarian: 'Δρ. Κώστας Μιχαήλ',
      petName: 'Λούνα',
      petEmoji: '🐱',
      diagnosis: 'Προληπτική αγωγή',
      icon: Pill,
      color: 'bg-purple-500',
      status: 'ongoing'
    },
    {
      id: 4,
      date: '28 Φεβ 2024',
      type: 'Εργαστήριο',
      title: 'Εξετάσεις Αίματος',
      veterinarian: 'Δρ. Ελένη Κοντού',
      petName: 'Μπέλλα',
      petEmoji: '🐕',
      diagnosis: 'Αποτελέσματα φυσιολογικά',
      icon: FileText,
      color: 'bg-orange-500',
      status: 'completed'
    }
  ];

  const quickStats = [
    { label: 'Εξετάσεις', value: '12', color: 'bg-blue-100 text-blue-600' },
    { label: 'Εμβόλια', value: '8', color: 'bg-green-100 text-green-600' },
    { label: 'Φάρμακα', value: '5', color: 'bg-purple-100 text-purple-600' }
  ];

  return (
    <div className="w-[375px] h-[812px] bg-gradient-to-br from-blue-50 to-green-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center justify-between">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-gray-900">Ιατρικά Αρχεία</h1>
        <Button variant="ghost" size="sm">
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="bg-white p-4 border-b">
        <div className="text-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Επισκόπηση Υγείας</h2>
          <p className="text-sm text-gray-600">Συνολικά αρχεία για όλα τα κατοικίδια</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {quickStats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`${stat.color} rounded-lg p-3 mx-auto mb-2 w-fit`}>
                <span className="text-lg font-bold">{stat.value}</span>
              </div>
              <p className="text-xs text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Medical Records List */}
      <div className="flex-1 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Πρόσφατα Αρχεία</h3>
          <Badge variant="secondary" className="bg-blue-100 text-blue-600">
            {mockRecords.length} αρχεία
          </Badge>
        </div>

        <div className="space-y-3">
          {mockRecords.map((record) => (
            <Card key={record.id} className="bg-white shadow-sm border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  {/* Icon & Pet Info */}
                  <div className="flex flex-col items-center space-y-1">
                    <div className={`p-2 rounded-full ${record.color} text-white`}>
                      <record.icon className="h-4 w-4" />
                    </div>
                    <div className="text-lg">{record.petEmoji}</div>
                  </div>

                  {/* Record Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{record.title}</h4>
                        <p className="text-sm text-gray-600">{record.petName}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-gray-500 text-xs mb-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {record.date}
                        </div>
                        <Badge 
                          variant={record.status === 'completed' ? 'secondary' : 'default'}
                          className={record.status === 'completed' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-orange-100 text-orange-600'
                          }
                        >
                          {record.status === 'completed' ? '✅ Ολοκληρώθηκε' : '🔄 Σε εξέλιξη'}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-700">
                        <Stethoscope className="h-3 w-3 inline mr-1" />
                        {record.veterinarian}
                      </p>
                      <p className="text-sm text-gray-600">{record.diagnosis}</p>
                      
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {record.type}
                        </Badge>
                        <Button variant="ghost" size="sm" className="h-6 text-xs text-blue-600">
                          <FileText className="h-3 w-3 mr-1" />
                          Προβολή
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 text-xs text-green-600">
                          <Download className="h-3 w-3 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upcoming Appointments */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-full p-2">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">Επόμενο Ραντεβού</h4>
                <p className="text-sm opacity-90">22 Μαρτίου - Εξέταση Ρουτίνας για Ρεξ</p>
              </div>
              <Heart className="h-5 w-5 opacity-80" />
            </div>
          </CardContent>
        </Card>

        {/* Add Record Button */}
        <Button className="w-full bg-gradient-to-r from-blue-500 to-green-600 text-white py-3 text-lg font-semibold">
          🏥 Προσθήκη Ιατρικού Αρχείου
        </Button>
      </div>
    </div>
  );
};

export default MedicalRecordsScreenshot;