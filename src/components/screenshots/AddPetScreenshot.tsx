import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Camera, Calendar } from 'lucide-react';

const AddPetScreenshot = () => {
  return (
    <div className="w-[375px] h-[812px] bg-gradient-to-br from-green-50 to-blue-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center justify-between">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-gray-900">Νέο Κατοικίδιο</h1>
        <Button variant="ghost" size="sm" className="text-green-600 font-medium">
          Αποθήκευση
        </Button>
      </div>

      {/* Form Content */}
      <div className="flex-1 p-4 space-y-6">
        {/* Pet Photo */}
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-4">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <Button variant="outline" size="sm">
                📸 Προσθήκη Φωτογραφίας
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card className="bg-white">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="petName" className="text-sm font-medium text-gray-700">
                Όνομα Κατοικιδίου *
              </Label>
              <Input 
                id="petName"
                placeholder="π.χ. Μπέλλα"
                value="Μπέλλα"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="species" className="text-sm font-medium text-gray-700">
                Είδος *
              </Label>
              <select className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white">
                <option value="dog">🐕 Σκύλος</option>
                <option value="cat">🐱 Γάτα</option>
                <option value="bird">🐦 Πουλί</option>
                <option value="rabbit">🐰 Κουνέλι</option>
                <option value="fish">🐠 Ψάρι</option>
                <option value="other">🐾 Άλλο</option>
              </select>
            </div>

            <div>
              <Label htmlFor="breed" className="text-sm font-medium text-gray-700">
                Ράτσα
              </Label>
              <Input 
                id="breed"
                placeholder="π.χ. Golden Retriever"
                value="Golden Retriever"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
                  Φύλο
                </Label>
                <select className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white">
                  <option value="female">♀️ Θηλυκό</option>
                  <option value="male">♂️ Αρσενικό</option>
                </select>
              </div>
              <div>
                <Label htmlFor="weight" className="text-sm font-medium text-gray-700">
                  Βάρος (kg)
                </Label>
                <Input 
                  id="weight"
                  type="number"
                  placeholder="25"
                  value="25"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="birthdate" className="text-sm font-medium text-gray-700">
                Ημερομηνία Γέννησης
              </Label>
              <div className="relative mt-1">
                <Input 
                  id="birthdate"
                  placeholder="15/03/2020"
                  value="15/03/2020"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card className="bg-white">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="microchip" className="text-sm font-medium text-gray-700">
                Αριθμός Microchip
              </Label>
              <Input 
                id="microchip"
                placeholder="123456789012345"
                value="982000123456789"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                Σημειώσεις
              </Label>
              <Textarea 
                id="notes"
                placeholder="Επιπλέον πληροφορίες για το κατοικίδιό σας..."
                value="Πολύ φιλική και ενεργητική. Της αρέσει να παίζει με άλλα σκυλιά."
                className="mt-1 h-20"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 text-lg font-semibold">
          💾 Αποθήκευση Κατοικιδίου
        </Button>
      </div>
    </div>
  );
};

export default AddPetScreenshot;