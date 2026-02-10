import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Check, Clock, ClipboardList } from 'lucide-react';
import axios from 'axios';
import { MoodStatus, MOOD_OPTIONS, ACTIVITY_CATEGORIES } from '@/types/dependent';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils'; // Ou le chemin correct vers votre utilitaire

// Type Medication mis à jour pour correspondre à la structure API
interface Medication {
  id: string;
  medication_name: string; // Adapté au backend
  dosage: string;
  intake_time: string;     // Adapté au backend
  status: string;          // Utilisation du status réel (TO_TAKE, TAKEN, MISSED)
}

interface Activity {
  id: string;
  category: keyof typeof ACTIVITY_CATEGORIES;
  date: string;
  time: string;
}

const Home: React.FC = () => {
  const [currentMood, setCurrentMood] = useState<MoodStatus | null>(null);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [medicationIntakes, setMedicationIntakes] = useState<Medication[]>([]);
  const [loadingMeds, setLoadingMeds] = useState(true);

  const today = new Date().toISOString().split('T')[0];
  const token = localStorage.getItem('access_token');

  // --- MISE À JOUR : Récupération des médicaments via l'endpoint /today ---
  const fetchTodayMedications = async () => {
    try {
      setLoadingMeds(true);
      const response = await axios.get('http://localhost:8000/dependent/medications/today', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMedicationIntakes(response.data);
    } catch (error) {
      console.error("Erreur meds:", error);
    } finally {
      setLoadingMeds(false);
    }
  };

  useEffect(() => {
    fetchTodayMedications();
  }, []);

  // Calculs pour la barre de progression
  const takenMedications = medicationIntakes.filter(m => m.status === 'TAKEN').length;
  const totalMedications = medicationIntakes.length;
  const progressPercent = totalMedications > 0 ? (takenMedications / totalMedications) * 100 : 0;

  // --- MISE À JOUR : Marquer comme pris via l'endpoint /take ---
  const handleMedicationTaken = async (id: string) => {
    try {
      await axios.patch(`http://localhost:8000/dependent/medications/${id}/take`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast({ title: 'Médicament pris', description: 'La prise a été enregistrée avec succès.' });
      
      // Rafraîchir la liste après modification
      fetchTodayMedications();
    } catch (error) {
      toast({ 
        title: 'Erreur', 
        description: 'Impossible d\'enregistrer la prise.',
        variant: 'destructive'
      });
    }
  };

  // --- Fetch des activités (inchangé) ---
  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/activities/by-date?date=${today}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (Array.isArray(response.data)) {
          const sorted = response.data.sort((a, b) => b.time.localeCompare(a.time));
          setRecentActivities(sorted.slice(0, 5));
        }
      } catch (error) {
        console.error('Erreur activités:', error);
      }
    };
    fetchRecentActivities();
  }, [today, token]);

  const handleMoodSelect = async (mood: MoodStatus) => {
    try {
      await axios.post('http://localhost:8000/health/status', { status_type: mood }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentMood(mood);
      toast({ title: 'État enregistré', description: `Votre état a été transmis.` });
    } catch (error) {
      console.error("Erreur statut:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section A: Current Mood (inchangé) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">💭</span> Mon état actuel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {(Object.entries(MOOD_OPTIONS) as [MoodStatus, typeof MOOD_OPTIONS[MoodStatus]][]).map(([key, value]) => (
              <Button
                key={key}
                onClick={() => handleMoodSelect(key)}
                className={`h-auto flex-col gap-2 py-4 text-white ${value.color} ${currentMood === key ? 'ring-4 ring-offset-2 ring-offset-background' : ''}`}
              >
                <span className="text-3xl">{value.icon}</span>
                <span className="text-xs font-medium sm:text-sm">{value.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section B: Today's Medications MODIFIÉE */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="text-2xl">💊</span> Médicaments du jour
            </span>
            <Badge variant="outline" className="text-sm">
              {takenMedications}/{totalMedications} pris
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progressPercent} className="h-3" />
          <div className="space-y-3">
            {loadingMeds ? (
              <p className="text-center py-4 text-muted-foreground">Chargement des médicaments...</p>
            ) : medicationIntakes.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">Aucun médicament prévu pour aujourd'hui.</p>
            ) : (
              medicationIntakes
                .sort((a, b) => a.intake_time.localeCompare(b.intake_time))
                .map(medication => (
                  <div key={medication.id} className={`flex items-center justify-between rounded-lg border p-4 ${
                    medication.status === 'TAKEN'
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                      : medication.status === 'MISSED'
                      ? 'border-red-200 bg-red-50'
                      : 'border-border bg-card'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full",
                        medication.status === 'TAKEN' ? "bg-green-500" : "bg-muted"
                      )}>
                        {medication.status === 'TAKEN' ? <Check className="h-5 w-5 text-white" /> : <Clock className="h-5 w-5 text-muted-foreground" />}
                      </div>
                      <div>
                        <p className="font-semibold">{medication.medication_name} {medication.dosage}</p>
                        <p className="text-sm text-muted-foreground">
                          {medication.intake_time.slice(0, 5)} 
                          {medication.status === 'MISSED' && <span className="text-red-500 ml-2 font-bold">(Manqué)</span>}
                        </p>
                      </div>
                    </div>
                    {medication.status === 'TO_TAKE' && (
                      <Button size="sm" onClick={() => handleMedicationTaken(medication.id)} className="gap-1">
                        <Check className="h-4 w-4" /> Pris
                      </Button>
                    )}
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section D: Recent Activities (inchangé) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">📝</span> Activités récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivities.length > 0 ? (
            recentActivities.map(activity => (
              <div key={activity.id} className="flex items-center justify-between mb-3 rounded-lg border p-4 bg-card">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-2xl">
                    {ACTIVITY_CATEGORIES[activity.category].icon}
                  </div>
                  <div>
                    <p className="font-semibold">{ACTIVITY_CATEGORIES[activity.category].label}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(activity.date).toLocaleDateString('fr-FR')} - {activity.time}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">Aucune activité enregistrée récemment</p>
          )}

          <Link to="/dependent/activities">
            <Button className="mt-4 w-full gap-2">
              <ClipboardList className="h-4 w-4" /> Ajouter une activité
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;