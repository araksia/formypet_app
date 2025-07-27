import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Stethoscope, Pill, Scissors, Heart, ArrowLeft, Plus } from 'lucide-react';

const CalendarScreenshot = () => {
  const mockEvents = [
    {
      id: 1,
      time: '09:00',
      title: 'Φάρμακο Βιταμίνης',
      pet: 'Μπέλλα',
      type: 'medication',
      icon: Pill,
      color: 'bg-blue-500'
    },
    {
      id: 2,
      time: '14:30',
      title: 'Εξέταση Ρουτίνας',
      pet: 'Μάξ',
      type: 'vet',
      icon: Stethoscope,
      color: 'bg-green-500'
    },
    {
      id: 3,
      time: '16:00',
      title: 'Κούρεμα',
      pet: 'Λούνα',
      type: 'grooming',
      icon: Scissors,
      color: 'bg-purple-500'
    },
    {
      id: 4,
      time: '18:00',
      title: 'Βόλτα στο Πάρκο',
      pet: 'Ρεξ',
      type: 'exercise',
      icon: Heart,
      color: 'bg-orange-500'
    }
  ];

  const weekDays = ['Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ', 'Κυρ'];
  const currentDay = 2; // Wednesday

  return (
    <div className="w-[375px] h-[812px] bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center justify-between">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-gray-900">Ημερολόγιο</h1>
        <Button variant="ghost" size="sm">
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {/* Date Header */}
      <div className="bg-white p-4 border-b">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">15 Μαρτίου</h2>
          <p className="text-gray-600">Τετάρτη, 2024</p>
        </div>

        {/* Week View */}
        <div className="flex justify-between">
          {weekDays.map((day, index) => (
            <div
              key={day}
              className={`flex flex-col items-center p-2 rounded-lg ${
                index === currentDay
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600'
              }`}
            >
              <span className="text-xs font-medium">{day}</span>
              <span className={`text-lg font-bold mt-1 ${
                index === currentDay ? 'text-blue-600' : 'text-gray-900'
              }`}>
                {13 + index}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 p-4 space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Σημερινά Events</h3>
          <Badge variant="secondary" className="bg-blue-100 text-blue-600">
            4 events
          </Badge>
        </div>

        {mockEvents.map((event) => (
          <Card key={event.id} className="bg-white shadow-sm border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${event.color} text-white`}>
                  <event.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">{event.title}</h4>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="h-3 w-3 mr-1" />
                      {event.time}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Για τον/την {event.pet}</p>
                  <Badge 
                    variant="outline" 
                    className="mt-2 text-xs"
                  >
                    {event.type === 'medication' && '💊 Φάρμακο'}
                    {event.type === 'vet' && '🏥 Κτηνίατρος'}
                    {event.type === 'grooming' && '✂️ Καλλωπισμός'}
                    {event.type === 'exercise' && '🏃 Άσκηση'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add Event Button */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-4 text-center">
            <Plus className="h-6 w-6 mx-auto mb-2" />
            <p className="font-medium">Προσθήκη Νέου Event</p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t px-4 py-2">
        <div className="flex justify-around">
          <Button variant="ghost" size="sm" className="flex-col space-y-1">
            <Heart className="h-5 w-5" />
            <span className="text-xs">Pets</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col space-y-1 text-blue-600">
            <Calendar className="h-5 w-5" />
            <span className="text-xs">Calendar</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col space-y-1">
            <Stethoscope className="h-5 w-5" />
            <span className="text-xs">Health</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col space-y-1">
            <Plus className="h-5 w-5" />
            <span className="text-xs">Add</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CalendarScreenshot;