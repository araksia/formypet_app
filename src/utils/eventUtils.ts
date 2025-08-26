import { Pill, Stethoscope, Star, Activity } from 'lucide-react';

export const getEventTypeLabel = (type: string): string => {
  const types: { [key: string]: string } = {
    'medication': 'Φάρμακο',
    'vaccination': 'Εμβόλιο',
    'checkup': 'Εξέταση',
    'grooming': 'Grooming',
    'birthday': 'Γενέθλια',
    'feeding': 'Φαγητό',
    'exercise': 'Άσκηση'
  };
  return types[type] || type;
};

export const getEventIcon = (type: string) => {
  const icons: { [key: string]: any } = {
    'medication': Pill,
    'vaccination': Stethoscope,
    'checkup': Stethoscope,
    'grooming': Star,
    'birthday': Star,
    'feeding': Star,
    'exercise': Activity
  };
  return icons[type] || Activity;
};