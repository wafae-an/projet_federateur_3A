import { useState, useEffect, useRef, useMemo } from 'react';
import { AlertTriangle, Clock, Check, Eye, Shield, Heart, Brain, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Types pour correspondre à votre table "anomalies"
interface Anomaly {
  id: string;
  activity_name: string;
  priority: 'High' | 'Medium' | 'Low';
  time: string;
  date: string;
  status: 'active' | 'seen';
}

const CaregiverAlerts = () => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialisation de l'alerte sonore
  useEffect(() => {
    audioRef.current = new Audio('/sounds/alert.mp3'); // Assurez-vous que le fichier existe dans public/sounds/
  }, []);

  // 1. Charger l'historique du jour (Service GET)
  const fetchTodayAnomalies = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:8000/anomalies/today');
      if (!response.ok) throw new Error('Erreur réseau');
      const data = await response.json();
      setAnomalies(data);
    } catch (err) {
      toast.error("Impossible de charger l'historique");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Gestion du Temps Réel (WebSocket)
  useEffect(() => {
    fetchTodayAnomalies();

    const socket = new WebSocket('ws://localhost:8000/monitoring/ws');

    socket.onopen = () => setIsConnected(true);
    socket.onclose = () => setIsConnected(false);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.category === "anormal") {
        // Alerte sonore pour priorité haute
        if (data.priority === "High" && audioRef.current) {
          audioRef.current.play().catch(() => console.log("Audio blocké"));
        }

        const newAnomaly: Anomaly = {
          id: data.id || crypto.randomUUID(),
          activity_name: data.activity,
          priority: data.priority,
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          date: new Date().toISOString(),
          status: 'active'
        };

        setAnomalies(prev => [newAnomaly, ...prev]);
        toast.error(`Activité anormale détectée : ${data.activity}`);
      }
    };

    return () => socket.close();
  }, []);

  // 3. Marquer comme "Pris en compte" (Service PATCH)
  const handleAcknowledge = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/anomalies/${id}/acknowledge`, {
        method: 'PATCH'
      });

      if (response.ok) {
        setAnomalies(prev => 
          prev.map(ano => ano.id === id ? { ...ano, status: 'seen' } : ano)
        );
        toast.success('Alerte mise à jour');
      }
    } catch (err) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  // Tri par heure (les plus récentes en haut)
  const sortedAnomalies = useMemo(() => {
    return [...anomalies].sort((a, b) => b.time.localeCompare(a.time));
  }, [anomalies]);

  // Styles de priorité
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'High': return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-600' };
      case 'Medium': return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-500' };
      case 'Low': return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-500' };
      default: return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-600' };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header avec indicateur de connexion */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alertes d'Activités</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            {isConnected ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
            {isConnected ? 'Surveillance en direct' : 'Déconnecté du serveur'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchTodayAnomalies}>
          <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
          Actualiser
        </Button>
      </div>

      {/* Liste des Anomalies */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Activités du jour
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : sortedAnomalies.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              <Shield className="mx-auto h-10 w-10 text-green-500 mb-2" />
              Aucune activité anormale pour le moment.
            </div>
          ) : (
            sortedAnomalies.map((anomaly) => {
              const config = getPriorityConfig(anomaly.priority);
              const isSeen = anomaly.status === 'seen';

              return (
                <div 
                  key={anomaly.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border-2 transition-all",
                    config.bg, config.border,
                    isSeen && "opacity-50 grayscale border-dashed border-gray-300 bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("p-2 rounded-full bg-white shadow-sm", config.color)}>
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900 uppercase">
                          {anomaly.activity_name.replace('_', ' ')}
                        </h4>
                        <Badge className={cn("border-none", isSeen ? "bg-gray-400" : config.badge)}>
                          {anomaly.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" /> Detecté à {anomaly.time}
                      </p>
                    </div>
                  </div>

                  {!isSeen ? (
                    <Button 
                      size="sm" 
                      onClick={() => handleAcknowledge(anomaly.id)}
                      className="bg-white text-gray-900 border hover:bg-gray-100"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Pris en compte
                    </Button>
                  ) : (
                    <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50">
                      <Check className="h-3 w-3 mr-1" /> Vérifié
                    </Badge>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Reassurance Footer */}
      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 flex gap-3">
        <Brain className="h-6 w-6 text-primary shrink-0" />
        <p className="text-sm text-muted-foreground">
          <strong>Intelligence Artificielle VigiHome :</strong> Ces alertes sont basées sur les écarts de routine. 
          Le bouton "Pris en compte" permet de notifier les autres aidants que vous avez vérifié la situation.
        </p>
      </div>
    </div>
  );
};

export default CaregiverAlerts;