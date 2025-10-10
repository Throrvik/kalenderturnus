import { Link, useLocation } from "react-router-dom";
import { Calendar, Users, Mail, Info, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { path: "/", label: "Kalender", icon: Calendar },
    { path: "/kollegaer", label: "Kollegaer", icon: Users },
    { path: "/om-oss", label: "Om oss", icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <Calendar className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">
            <span className="text-foreground">Min</span>
            <span className="text-primary">Turnus</span>
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center space-x-2">
          <Link to="/profil">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/innlogging">
            <Button variant="outline" className="gap-2">
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Logg inn</span>
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Mobile navigation */}
      <nav className="md:hidden border-t border-border bg-card px-4 py-2">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  className="flex-col h-auto py-2 px-3"
                >
                  <Icon className="h-4 w-4 mb-1" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
};

export default Header;
