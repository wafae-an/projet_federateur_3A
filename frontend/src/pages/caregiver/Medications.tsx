import { useState, useEffect } from 'react';
import { Plus, Pill, Clock, Check, X, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, addDays, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import axios from 'axios';
import { toast } from 'sonner';

const CaregiverMedications = () => {
  const [medications, setMedications] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // État pour savoir si on édite un médicament existant
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    medication_name: '',
    dosage: '',
    intake_date: format(new Date(), 'yyyy-MM-dd'),
    intake_time: '',
  });

  const token = localStorage.getItem('access_token');

  const fetchMedications = async (date: Date) => {
    setLoading(true);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const response = await axios.get(`http://127.0.0.1:8000/medications/history?selected_date=${formattedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMedications(response.data);
    } catch (error) {
      console.error("Erreur meds", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedications(selectedDate);
  }, [selectedDate]);

  // --- SUPPRESSION ---
  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette prise ?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/medications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Prise supprimée');
      fetchMedications(selectedDate);
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  // --- OUVERTURE MODALE ÉDITION ---
  const openEditDialog = (med: any) => {
    setEditingId(med.id);
    setFormData({
      medication_name: med.medication_name,
      dosage: med.dosage || '',
      intake_date: med.intake_date,
      intake_time: med.intake_time.slice(0, 5),
    });
    setIsAddDialogOpen(true);
  };

  // --- SOUMISSION (CREATE OU UPDATE) ---
  const handleSubmit = async () => {
    if (!formData.medication_name || !formData.intake_date || !formData.intake_time) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }

    try {
      if (editingId) {
        // Mode Mise à jour
        await axios.put(`http://127.0.0.1:8000/medications/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Médicament mis à jour');
      } else {
        // Mode Création
        await axios.post('http://127.0.0.1:8000/medications/create', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Médicament programmé');
      }
      
      setIsAddDialogOpen(false);
      resetForm();
      fetchMedications(selectedDate);
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      medication_name: '',
      dosage: '',
      intake_date: format(selectedDate, 'yyyy-MM-dd'),
      intake_time: '',
    });
  };

  const getStatusBadge = (status: string) => {
    const config: any = {
      'TO_TAKE': { color: 'bg-blue-100 text-blue-700', icon: <Clock className="w-3 h-3 mr-1" />, label: 'À prendre' },
      'TAKEN': { color: 'bg-green-100 text-green-700', icon: <Check className="w-3 h-3 mr-1" />, label: 'Pris' },
      'MISSED': { color: 'bg-red-100 text-red-700', icon: <X className="w-3 h-3 mr-1" />, label: 'Manqué' }
    };
    const s = config[status] || config['TO_TAKE'];
    return <Badge className={cn(s.color, "border-0")}>{s.icon} {s.label}</Badge>;
  };

  return (
    <div className="space-y-8 p-4">
      {/* HEADER AVEC SÉLECTEUR DE DATE */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Suivi Médical</h1>
            <div className="flex items-center gap-2 mt-1">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setSelectedDate(subDays(selectedDate, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-9 gap-2 min-w-[150px]">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} locale={fr} />
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if(!open) resetForm(); // Reset au cas où on ferme sans enregistrer
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={resetForm}><Plus className="h-4 w-4" /> Programmer une prise</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingId ? 'Modifier la prise' : 'Nouveau Médicament'}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom du médicament *</Label>
                  <Input value={formData.medication_name} onChange={e => setFormData({...formData, medication_name: e.target.value})} placeholder="Ex: Doliprane" />
                </div>
                <div className="space-y-2">
                  <Label>Dosage</Label>
                  <Input value={formData.dosage} onChange={e => setFormData({...formData, dosage: e.target.value})} placeholder="Ex: 500mg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input type="date" value={formData.intake_date} onChange={e => setFormData({...formData, intake_date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Heure *</Label>
                  <Input type="time" value={formData.intake_time} onChange={e => setFormData({...formData, intake_time: e.target.value})} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSubmit}>{editingId ? 'Mettre à jour' : 'Enregistrer'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-primary/20 shadow-sm">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Pill className="h-5 w-5 text-primary" />
            Prises du {format(selectedDate, 'dd/MM/yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-3">
          {loading ? (
            <div className="text-center py-10"><p>Chargement...</p></div>
          ) : medications.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed rounded-xl"><p className="text-muted-foreground">Aucun médicament prévu.</p></div>
          ) : (
            medications
              .sort((a, b) => a.intake_time.localeCompare(b.intake_time))
              .map(med => (
                <div key={med.id} className={cn(
                  "flex items-center justify-between p-4 rounded-xl border transition-all",
                  med.status === 'TAKEN' ? "bg-green-50/50 border-green-100" : 
                  med.status === 'MISSED' ? "bg-red-50/50 border-red-100" : "bg-card shadow-sm hover:shadow-md"
                )}>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center",
                      med.status === 'TAKEN' ? "bg-green-100 text-green-600" : 
                      med.status === 'MISSED' ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary"
                    )}>
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">
                        {med.medication_name} 
                        {med.dosage && <span className="text-sm font-normal text-muted-foreground ml-2">({med.dosage})</span>}
                      </h4>
                      <p className="text-sm text-muted-foreground font-medium">Heure : {med.intake_time.slice(0, 5)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(med.status)}
                    
                    {/* BOUTONS ACTIONS */}
                    <div className="flex gap-1 border-l pl-3 ml-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => openEditDialog(med)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(med.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CaregiverMedications;