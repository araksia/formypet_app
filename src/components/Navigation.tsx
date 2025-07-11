
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Heart, Calendar, Settings, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navigation = () => {
  const navItems = [
    { icon: Home, label: 'Αρχική', path: '/' },
    { icon: Heart, label: 'Κατοικίδια', path: '/pets' },
    { icon: Plus, label: 'Προσθήκη', path: '/add-pet' },
    { icon: Calendar, label: 'Ημερολόγιο', path: '/calendar' },
    { icon: Settings, label: 'Ρυθμίσεις', path: '/settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-0 flex-1",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <Icon className="h-5 w-5 mb-1" />
            <span className="text-xs text-center truncate">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
