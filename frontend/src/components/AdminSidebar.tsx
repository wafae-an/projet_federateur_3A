import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Ajout de useNavigate
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner'; // Notification
import {
  LayoutDashboard,
  Users,
  UserCheck,
  LogOut,
  Heart,
  Menu,
  X,
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navItems = [
  {
    label: 'Tableau de bord',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Gestion des caregivers',
    href: '/admin/caregivers',
    icon: UserCheck,
  },
  {
    label: 'Gestion des surveillés',
    href: '/admin/dependents',
    icon: Users,
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate(); // Hook pour la redirection
  const { logout } = useAuth();

  // Fonction de déconnexion personnalisée
  const handleLogout = () => {
    try {
      if (logout) {
        logout(); // Appelle la logique du contexte (nettoyage état + storage)
      } else {
        localStorage.removeItem('access_token');
      }
      
      toast.success("Session administrateur fermée");
      navigate('/login'); // Redirection vers la page de connexion
    } catch (error) {
      toast.error("Erreur lors de la déconnexion");
    }
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
        {/* Logo Section */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
            <Heart className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">VigiHome</h1>
            <p className="text-xs text-sidebar-foreground/60">Administration</p>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 space-y-2 p-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={isActive ? 'sidebar-active' : 'sidebar'}
                  className="w-full justify-start gap-3"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="border-t border-sidebar-border p-4">
          <Button
            variant="ghost"
            onClick={handleLogout} // Utilisation de la fonction handleLogout
            className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive transition-all"
          >
            <LogOut className="h-5 w-5" />
            Déconnexion
          </Button>
        </div>
      </aside>
    </>
  );
};