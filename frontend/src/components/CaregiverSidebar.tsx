import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom'; // Ajout de useNavigate
import { Pill, Activity, AlertTriangle, Heart, User, LogOut } from 'lucide-react'; // Ajout de LogOut
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button'; // Assurez-vous d'avoir ce composant ou utilisez <button>
import axios from 'axios';
import { MOOD_OPTIONS, HealthStatusHistoryItem } from '@/types/dependent';
import { toast } from 'sonner';

const navItems = [
  { to: '/caregiver/health', icon: Heart, label: 'État de Santé' },
  { to: '/caregiver', icon: Pill, label: 'Médicaments', end: true },
  { to: '/caregiver/activities', icon: Activity, label: 'Activités' },
  { to: '/caregiver/alerts', icon: AlertTriangle, label: 'Alertes' },
];

const CaregiverSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Initialisation du hook de navigation
  const [latestStatus, setLatestStatus] = useState<HealthStatusHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  // --- FONCTION DE DÉCONNEXION ---
  const handleLogout = () => {
    localStorage.removeItem('access_token'); // Suppression du token
    toast.success("Déconnexion réussie");
    navigate('/login'); // Redirection
  };

  // --- RÉCUPÉRATION DU DERNIER STATUT (inchangé) ---
  useEffect(() => {
    const fetchLatestStatus = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const today = new Date().toISOString().split('T')[0];
        const response = await axios.get(`http://localhost:8000/health/history?selected_date=${today}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data && response.data.length > 0) {
          setLatestStatus(response.data[0]);
        }
      } catch (error) {
        console.error("Erreur sidebar status:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestStatus();
    const interval = setInterval(fetchLatestStatus, 300000);
    return () => clearInterval(interval);
  }, []);

  const getStatusDisplay = () => {
    if (loading) return { label: 'Chargement...', color: 'bg-gray-400', icon: '⏳' };
    if (!latestStatus) return { label: 'Aucun suivi', color: 'bg-gray-400', icon: '❓' };
    const statusKey = latestStatus.status;
    const config = MOOD_OPTIONS[statusKey];
    return {
      label: config?.label || 'Inconnu',
      color: config?.color.split(' ')[0] || 'bg-gray-400',
      icon: config?.icon || ''
    };
  };

  const display = getStatusDisplay();

  return (
    <aside className="fixed left-0 top-0 z-40 h-full w-64 flex-col bg-sidebar transition-transform duration-300 lg:translate-x-0 border-r border-sidebar-border flex">
      {/* Header */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
          <Heart className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-sidebar-foreground">VigiHome</h1>
          <p className="text-xs text-sidebar-foreground/60">Espace Aidant</p>
        </div>
      </div>

      {/* Dependent Info Card */}
      <div className="mx-4 mt-4 rounded-lg border border-sidebar-border bg-sidebar-primary/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-primary/20">
            <User className="h-5 w-5 text-sidebar-primary" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-sidebar-foreground truncate">
              {latestStatus ? latestStatus.full_name : "Chargement..."}
            </p>
            <p className="text-xs text-sidebar-foreground/60">
              {latestStatus ? `${latestStatus.age} ans` : "-- ans"}
            </p>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-sidebar-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("h-2 w-2 rounded-full animate-pulse", display.color)} />
            <span className="text-xs font-medium text-sidebar-foreground/80">{display.label}</span>
          </div>
          {latestStatus && (
            <span className="text-[10px] text-sidebar-foreground/40 font-mono">
              {latestStatus.log_time}
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.end 
            ? location.pathname === item.to 
            : location.pathname.startsWith(item.to);
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1">{item.label}</span>
              {item.label === 'Alertes' && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  3
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer avec Bouton Déconnexion */}
      <div className="border-t border-sidebar-border p-4 space-y-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Déconnexion</span>
        </button>
        
        <p className="text-center text-[10px] uppercase tracking-wider text-sidebar-foreground/40 font-semibold">
          Interface Bienveillante
        </p>
      </div>
    </aside>
  );
};

export default CaregiverSidebar;