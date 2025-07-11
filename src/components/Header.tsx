
import React from 'react';
import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  title: string;
  showNotifications?: boolean;
  showProfile?: boolean;
}

const Header = ({ title, showNotifications = true, showProfile = true }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-xl font-bold text-primary">For My Pet</h1>
        <div className="flex items-center space-x-2">
          {showNotifications && (
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"></span>
            </Button>
          )}
          {showProfile && (
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
      {title !== "For My Pet" && (
        <div className="px-4 pb-3">
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
      )}
    </header>
  );
};

export default Header;
