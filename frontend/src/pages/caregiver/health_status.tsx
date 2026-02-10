import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, User, ChevronRight } from 'lucide-react';
import { MOOD_OPTIONS, HealthStatusHistoryItem } from '@/types/dependent';
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";

const HealthHistory = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [history, setHistory] = useState<HealthStatusHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async (selectedDate: Date) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const response = await axios.get(`http://localhost:8000/health/history?selected_date=${formattedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération de l'historique", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(date);
  }, [date]);

  return (
    <div className="p-6 space-y-6">
      {/* Header avec sélecteur de date */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold">Suivi du bien-être</h2>
          <p className="text-muted-foreground text-sm">Historique des états déclarés par le surveillé</p>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP', { locale: fr }) : <span>Choisir une date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
              initialFocus
              locale={fr}
            />
          </PopoverContent>
        </Popover>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Chronologie du {format(date, 'dd MMMM yyyy', { locale: fr })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">Chargement...</div>
          ) : history.length > 0 ? (
            <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-muted before:via-muted before:to-transparent">
              {history.map((item, index) => {
                const moodConfig = MOOD_OPTIONS[item.status as keyof typeof MOOD_OPTIONS];
                return (
                  <div key={index} className="relative flex items-center gap-4 pl-10 group">
                    {/* Point sur la ligne */}
                    <div className={cn(
                      "absolute left-0 flex h-10 w-10 items-center justify-center rounded-full border-4 border-background shadow-sm transition-transform group-hover:scale-110",
                      moodConfig?.color || "bg-gray-500"
                    )}>
                      <span className="text-lg">{moodConfig?.icon}</span>
                    </div>
                    
                    {/* Contenu de la carte */}
                    <div className="flex-1 bg-accent/30 hover:bg-accent/50 transition-colors p-4 rounded-lg border">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-lg">{moodConfig?.label}</span>
                        <Badge variant="secondary" className="font-mono">
                          {item.log_time}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>Déclaré par {item.full_name}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">Aucune donnée enregistrée pour cette date.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthHistory;