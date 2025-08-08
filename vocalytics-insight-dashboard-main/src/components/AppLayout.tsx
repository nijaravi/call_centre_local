
import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { BarChart3, Users, LineChart, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AppLayout() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    {
      name: "Agent View",
      path: "/agents",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Supervisor View",
      path: "/supervisor",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      name: "Business View",
      path: "/business",
      icon: <LineChart className="h-5 w-5" />,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navigation Bar */}
      <header className="bg-primary text-primary-foreground p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-xl font-bold">Vocalytics AI</h1>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "px-4 py-2 rounded-md transition-colors flex items-center space-x-2",
                location.pathname === item.path
                  ? "bg-sidebar-accent text-primary-foreground"
                  : "hover:bg-sidebar-accent/50 text-primary-foreground/80"
              )}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* User Menu Placeholder */}
        <div className="flex items-center">
          <Button variant="ghost" size="sm">
            Jane Doe
          </Button>
        </div>
      </header>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <Card className="md:hidden p-2 m-2 animate-fadeIn">
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-4 py-3 rounded-md transition-colors flex items-center space-x-3",
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </Card>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-secondary p-3 text-center text-sm text-muted-foreground">
        <p>Vocalytics AI © 2024 - Call Center Analytics Dashboard</p>
      </footer>
    </div>
  );
}
