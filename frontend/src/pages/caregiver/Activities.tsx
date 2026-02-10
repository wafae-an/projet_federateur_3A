import { useState, useEffect } from 'react';
import { Clock, Activity, Brain, User, Wifi, WifiOff, Calendar, CalendarDays } from 'lucide-react'; // Ajout de CalendarDays
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input'; // Assurez-vous d'avoir l'input Shadcn ou utilisez <input /> standard

const CaregiverActivities = () => {
  // 1. État pour la date sélectionnée (par défaut aujourd'hui)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [allActivities, setAllActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [lastWsUpdate, setLastWsUpdate] = useState<Date | null>(null);

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  // 2. Fonction pour charger l'historique hybride (Manual + Predicted)
  const loadHistory = async (date: string) => {
    setIsLoading(true);
    try {
      const [resManual, resPredicted] = await Promise.all([
        fetch(`http://localhost:8000/activities/manual?target_date=${date}`),
        fetch(`http://localhost:8000/activities/predicted?target_date=${date}`)
      ]);

      const manualData = await resManual.json();
      const predictedData = await resPredicted.json();

      const formattedManual = manualData.map(a => ({
        timestamp: `${a.date.split('T')[0]} ${a.time}:00`,
        activity: a.category,
        source: 'manual'
      }));

      const formattedPredicted = predictedData.map(a => ({
        timestamp: `${a.date.split('T')[0]} ${a.time}:00`,
        activity: a.category,
        source: 'predicted'
      }));

      setAllActivities([...formattedManual, ...formattedPredicted]);
    } catch (err) {
      console.error("Erreur chargement historique:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger l'historique quand la date change
  useEffect(() => {
    loadHistory(selectedDate);
  }, [selectedDate]);

  // 3. WebSocket (Activé UNIQUEMENT si on regarde la date d'aujourd'hui)
  useEffect(() => {
    if (!isToday) {
        setIsWsConnected(false);
        return; 
    }

    const socket = new WebSocket('ws://localhost:8000/monitoring/ws');
    socket.onopen = () => setIsWsConnected(true);
    socket.onmessage = (event) => {
      const newPrediction = JSON.parse(event.data);
      if (newPrediction.category === 'normal') {
        setAllActivities((prev) => {
          const alreadyExists = prev.some(a => a.timestamp === newPrediction.timestamp);
          if (alreadyExists) return prev;
          return [{ 
            timestamp: newPrediction.timestamp, 
            activity: newPrediction.activity, 
            source: 'predicted',
            isNew: true 
          }, ...prev];
        });
        setLastWsUpdate(new Date());
      }
    };
    socket.onclose = () => setIsWsConnected(false);
    return () => socket.close();
  }, [selectedDate, isToday]);

  // Tri final
  const sortedActivities = [...allActivities].sort((a, b) => 
    new Date(b.timestamp.replace(' ', 'T')).getTime() - new Date(a.timestamp.replace(' ', 'T')).getTime()
  );

  const formatTimestamp = (ts: string) => ts.split(' ')[1].substring(0, 5);
  const getActivityIcon = (activity: string) => { /* Votre logique */ return "📋"; };

  return (
    <div className="space-y-6 p-2">
      {/* Header avec sélecteur de date */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Journal d'activités</h1>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Calendar className="h-4 w-4" /> {selectedDate}
          </div>
        </div>

        <div className="flex items-center gap-3">
           {/* Champ de changement de date */}
           <div className="flex items-center bg-white border rounded-md px-2 shadow-sm">
             <CalendarDays className="h-4 w-4 text-gray-400 mr-2" />
             <Input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border-none shadow-none focus-visible:ring-0 text-xs w-32 p-1"
                max={new Date().toISOString().split('T')[0]} // Pas de futur
             />
           </div>

           <Badge variant={isWsConnected ? "outline" : "secondary"} className={cn(isWsConnected && "bg-green-50 text-green-700 border-green-200")}>
              {isWsConnected ? <><Wifi className="mr-1 h-3 w-3 animate-pulse" /> Live </> : "Archive"}
           </Badge>
        </div>
      </div>

      {/* Stats Rapides */}
      <div className="grid grid-cols-2 gap-4">
          <Card className="bg-blue-50/50 border-blue-100">
            <CardContent className="p-4 flex items-center gap-3">
                <Brain className="text-blue-600" />
                <div>
                    <p className="text-xl font-bold">{allActivities.filter(a => a.source === 'predicted').length}</p>
                    <p className="text-[10px] uppercase font-bold text-blue-600">Prédites</p>
                </div>
            </CardContent>
          </Card>
          <Card className="bg-green-50/50 border-green-100">
            <CardContent className="p-4 flex items-center gap-3">
                <User className="text-green-600" />
                <div>
                    <p className="text-xl font-bold">{allActivities.filter(a => a.source === 'manual').length}</p>
                    <p className="text-[10px] uppercase font-bold text-green-600">Manuelles</p>
                </div>
            </CardContent>
          </Card>
      </div>

      {/* Timeline (Design inchangé) */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4"><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></div>
          ) : sortedActivities.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground italic">Aucune donnée pour cette date</div>
          ) : (
            <div className="relative border-l-2 border-muted ml-4 pl-8 space-y-6">
              {sortedActivities.map((act, i) => (
                <div key={i} className={cn("relative", act.isNew && "animate-bounce")}>
                  <div className={cn(
                    "absolute -left-[45px] h-8 w-8 rounded-full border-2 flex items-center justify-center bg-white text-lg",
                    act.source === 'predicted' ? "border-blue-400" : "border-green-400"
                  )}>
                    {getActivityIcon(act.activity)}
                  </div>
                  <div className={cn(
                    "p-3 rounded-xl border",
                    act.source === 'predicted' ? "bg-blue-50/20 border-blue-100" : "bg-green-50/20 border-green-100"
                  )}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-muted-foreground">{formatTimestamp(act.timestamp)}</span>
                      <Badge variant="outline" className="text-[9px] uppercase">
                        {act.source === 'predicted' ? '🤖 IA' : '👤 Manuel'}
                      </Badge>
                    </div>
                    <p className="font-semibold">{act.activity.replace(/_/g, ' ')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CaregiverActivities;