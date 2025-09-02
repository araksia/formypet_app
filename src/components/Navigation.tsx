
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Heart, Calendar, Settings, Plus, Euro, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navigation = () => {
  const navItems = [
    { icon: Home, label: 'Αρχική', path: '/' },
    { icon: Heart, label: 'Κατοικίδια', path: '/pets' },
    { icon: Calendar, label: 'Ημερολόγιο', path: '/calendar' },
    { icon: Euro, label: 'Έξοδα', path: '/expenses' },
    { icon: Trophy, label: 'Στόχοι', path: '/achievements' },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50"
      role="navigation"
      aria-label="Κεντρική περιήγηση εφαρμογής"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex justify-around items-center h-16 px-2 safe-area-left safe-area-right">
        {navItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-0 flex-1 focus-enhanced",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground"
              )
            }
            aria-label={`${label} - ${path === window.location.pathname ? 'Τρέχουσα σελίδα' : 'Μετάβαση στην ' + label.toLowerCase()}`}
            aria-current={path === window.location.pathname ? 'page' : undefined}
          >
            <Icon className="h-5 w-5 mb-1" aria-hidden="true" />
            <span className="text-xs text-center truncate">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
