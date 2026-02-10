import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Ajout de useNavigate
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner'; // Pour notifier l'utilisateur
import {
  Home,
  ClipboardList,
  LogOut,
  Heart,
  Menu,
  X,
} from 'lucide-react';

interface DependentSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navItems = [
  { label: 'Accueil', href: '/dependent', icon: Home },
  { label: 'Activités', href: '/dependent/activities', icon: ClipboardList },
];

export const DependentSidebar: React.FC<DependentSidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  // On récupère logout depuis le contexte, ou on la définit ici si le contexte est vide
  const { logout } = useAuth(); 

  const handleLogout = () => {
    // 1. Appel de la fonction logout du contexte (si elle existe)
    if (logout) {
      logout();
    } else {
      // 2. Fallback manuel si le contexte n'est pas encore prêt
      localStorage.removeItem('access_token');
    }
    
    // 3. Notification et Redirection
    toast.success("Déconnexion réussie");
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Mobile toggle button */}
      <button
        onClick={onToggle}
        className="fixed left-4 top-4 z-50 rounded-lg bg-sidebar p-2 text-sidebar-foreground shadow-lg lg:hidden"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-full w-64 flex-col bg-sidebar transition-transform duration-300 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
            <Heart className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">VigiHome</h1>
            <p className="text-xs text-sidebar-foreground/60">Mon espace</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={isActive ? 'sidebar-active' : 'sidebar'}
                  className="w-full justify-start gap-3 text-base"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Logout Section modifiée */}
        <div className="border-t border-sidebar-border p-4">
          <Button
            variant="ghost"
            onClick={handleLogout} // Utilisation de la nouvelle fonction
            className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Déconnexion
          </Button>
        </div>
      </aside>
    </>
  );
};