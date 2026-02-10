import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Activity, ActivityCategory, ACTIVITY_CATEGORIES } from '@/types/dependent';
import { Plus, Pencil, Trash2, CalendarIcon, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Activities: React.FC = () => {
  const today = new Date();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [isViewMode, setIsViewMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ time: '', category: '' as ActivityCategory | '' });

  const accessToken = localStorage.getItem('access_token');

  const currentDateStr = format(selectedDate, 'yyyy-MM-dd');
  const todayStr = format(today, 'yyyy-MM-dd');

  const isToday = currentDateStr === todayStr;

  // === Fetch des activités pour une date donnée ===
  const fetchActivities = async (date: string) => {
    if (!accessToken) return;

    try {
      const res = await fetch(`http://localhost:8000/activities/by-date?date=${date}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Erreur lors de la récupération des activités');
      }
      const data: Activity[] = await res.json();
      setActivities(data);
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    }
  };

  // === useEffect pour charger les activités du jour au montage ===
  useEffect(() => {
    fetchActivities(todayStr);
  }, []);

  const handleAddActivity = async () => {
    if (!formData.time || !formData.category) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs', variant: 'destructive' });
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/activities/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ time: formData.time, category: formData.category }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Erreur lors de l\'ajout de l\'activité');
      }

      const newActivity: Activity = await res.json();
      setActivities((prev) => [...prev, newActivity]);
      setShowAddModal(false);
      setFormData({ time: '', category: '' });
      toast({ title: 'Activité ajoutée', description: 'Votre activité a été enregistrée' });
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    const dateStr = format(date, 'yyyy-MM-dd');
    setIsViewMode(dateStr !== todayStr);
    fetchActivities(dateStr);
  };

  const filteredActivities = activities.sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">📝 Activités</h1>
          <p className="mt-1 text-muted-foreground capitalize">
            {isToday
              ? `Aujourd'hui, le ${format(selectedDate, 'd MMMM yyyy', { locale: fr })}`
              : format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
          </p>
        </div>

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                Changer de date
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} locale={fr} />
            </PopoverContent>
          </Popover>

          {isToday && (
            <Button onClick={() => setShowAddModal(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter
            </Button>
          )}
        </div>
      </div>

      {isViewMode && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <Eye className="h-5 w-5 text-amber-600" />
          <p className="text-sm text-amber-700">Mode consultation uniquement</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            Journal de bord
            <Badge variant="secondary">{filteredActivities.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredActivities.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
              <p>Aucune activité pour cette date</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sidebar-primary/10 text-2xl">
                      {ACTIVITY_CATEGORIES[a.category].icon}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{ACTIVITY_CATEGORIES[a.category].label}</p>
                      <p className="text-sm text-muted-foreground font-medium">Heure : {a.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal ajout activité */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouvelle activité</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Heure</Label>
              <Input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v as ActivityCategory })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ACTIVITY_CATEGORIES).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val.icon} {val.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Annuler</Button>
            <Button onClick={handleAddActivity}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Activities;
