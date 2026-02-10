import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MedicationIntake } from '@/types/dependent';
import { mockMedicationIntakes, mockPrescriptions } from '@/data/dependentMockData';
import { Plus, Pencil, Trash2, Check, Download, Search, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format, subDays, subWeeks, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

const Medications: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const [intakes, setIntakes] = useState<MedicationIntake[]>(mockMedicationIntakes);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedIntake, setSelectedIntake] = useState<MedicationIntake | null>(null);
  const [historyFilter, setHistoryFilter] = useState<'day' | 'week' | 'month'>('week');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    prescriptionId: '',
    date: today,
    time: format(new Date(), 'HH:mm'),
    quantity: '1 comprimé',
    comment: '',
  });

  const todayIntakes = intakes
    .filter((i) => i.date === today)
    .sort((a, b) => a.time.localeCompare(b.time));

  const takenCount = todayIntakes.filter((i) => i.taken).length;
  const totalCount = todayIntakes.length;
  const progressPercent = totalCount > 0 ? (takenCount / totalCount) * 100 : 0;

  // Filter history based on period
  const getHistoryStartDate = () => {
    const now = new Date();
    switch (historyFilter) {
      case 'day':
        return subDays(now, 1);
      case 'week':
        return subWeeks(now, 1);
      case 'month':
        return subMonths(now, 1);
      default:
        return subWeeks(now, 1);
    }
  };

  const historyIntakes = intakes
    .filter((i) => {
      const intakeDate = new Date(i.date);
      const startDate = getHistoryStartDate();
      const matchesDate = intakeDate >= startDate;
      const matchesSearch = searchTerm
        ? i.medicationName.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      return matchesDate && matchesSearch;
    })
    .sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return b.time.localeCompare(a.time);
    });

  const successRate = historyIntakes.length > 0
    ? Math.round((historyIntakes.filter((i) => i.taken).length / historyIntakes.length) * 100)
    : 0;

  const handleAddIntake = () => {
    if (!formData.prescriptionId) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un médicament.',
        variant: 'destructive',
      });
      return;
    }

    const prescription = mockPrescriptions.find((p) => p.id === formData.prescriptionId);
    if (!prescription) return;

    const newIntake: MedicationIntake = {
      id: `m-${Date.now()}`,
      prescriptionId: formData.prescriptionId,
      medicationName: prescription.name,
      dosage: prescription.dosage,
      date: formData.date,
      time: formData.time,
      quantity: formData.quantity,
      comment: formData.comment || undefined,
      taken: true,
    };

    setIntakes((prev) => [...prev, newIntake]);
    setShowAddModal(false);
    resetForm();
    toast({
      title: 'Prise enregistrée',
      description: 'Votre prise de médicament a été enregistrée.',
    });
  };

  const handleEditIntake = () => {
    if (!selectedIntake) return;

    const prescription = mockPrescriptions.find((p) => p.id === formData.prescriptionId);

    setIntakes((prev) =>
      prev.map((i) =>
        i.id === selectedIntake.id
          ? {
              ...i,
              prescriptionId: formData.prescriptionId || i.prescriptionId,
              medicationName: prescription?.name || i.medicationName,
              dosage: prescription?.dosage || i.dosage,
              date: formData.date,
              time: formData.time,
              quantity: formData.quantity,
              comment: formData.comment || undefined,
            }
          : i
      )
    );

    setShowEditModal(false);
    resetForm();
    toast({
      title: 'Prise modifiée',
      description: 'Votre prise a été mise à jour.',
    });
  };

  const handleDeleteIntake = () => {
    if (!selectedIntake) return;

    setIntakes((prev) => prev.filter((i) => i.id !== selectedIntake.id));
    setShowDeleteDialog(false);
    setSelectedIntake(null);
    toast({
      title: 'Prise supprimée',
      description: 'La prise a été supprimée.',
    });
  };

  const openEditModal = (intake: MedicationIntake) => {
    setSelectedIntake(intake);
    setFormData({
      prescriptionId: intake.prescriptionId,
      date: intake.date,
      time: intake.time,
      quantity: intake.quantity,
      comment: intake.comment || '',
    });
    setShowEditModal(true);
  };

  const openDeleteDialog = (intake: MedicationIntake) => {
    setSelectedIntake(intake);
    setShowDeleteDialog(true);
  };

  const resetForm = () => {
    setFormData({
      prescriptionId: '',
      date: today,
      time: format(new Date(), 'HH:mm'),
      quantity: '1 comprimé',
      comment: '',
    });
    setSelectedIntake(null);
  };

  const handleExport = () => {
    toast({
      title: 'Export en cours',
      description: 'Votre historique sera téléchargé en PDF.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">💊 Médicaments</h1>
          <p className="mt-1 text-muted-foreground">
            Suivi de vos prises de médicaments
          </p>
        </div>
        
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Saisir une prise
        </Button>
      </div>

      <Tabs defaultValue="today" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="today">Prises du jour</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6">
          {/* Today's Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Progression du jour</span>
                <Badge variant="outline" className="text-lg">
                  {takenCount}/{totalCount} pris
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={progressPercent} className="h-4" />
              <p className="mt-2 text-center text-sm text-muted-foreground">
                {progressPercent === 100
                  ? '🎉 Tous les médicaments ont été pris !'
                  : `${totalCount - takenCount} médicament(s) restant(s)`}
              </p>
            </CardContent>
          </Card>

          {/* Today's Intakes */}
          <Card>
            <CardHeader>
              <CardTitle>Prises effectuées</CardTitle>
            </CardHeader>
            <CardContent>
              {todayIntakes.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <p>Aucune prise enregistrée aujourd'hui</p>
                  <Button
                    variant="link"
                    onClick={() => setShowAddModal(true)}
                    className="mt-2"
                  >
                    Enregistrer votre première prise
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayIntakes.map((intake) => (
                    <div
                      key={intake.id}
                      className={`flex items-center justify-between rounded-lg border p-4 ${
                        intake.taken
                          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                          : 'border-border bg-card'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            intake.taken ? 'bg-green-500' : 'bg-muted'
                          }`}
                        >
                          <Check className={`h-5 w-5 ${intake.taken ? 'text-white' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <p className="font-semibold">
                            {intake.medicationName} {intake.dosage}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {intake.time} - {intake.quantity}
                          </p>
                          {intake.comment && (
                            <p className="text-xs text-muted-foreground italic">
                              {intake.comment}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEditModal(intake)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => openDeleteDialog(intake)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {/* History Controls */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-2">
                  <Button
                    variant={historyFilter === 'day' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setHistoryFilter('day')}
                  >
                    Jour
                  </Button>
                  <Button
                    variant={historyFilter === 'week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setHistoryFilter('week')}
                  >
                    Semaine
                  </Button>
                  <Button
                    variant={historyFilter === 'month' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setHistoryFilter('month')}
                  >
                    Mois
                  </Button>
                </div>

                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button variant="outline" onClick={handleExport} className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Statistiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Taux de réussite</span>
                <span className="text-2xl font-bold text-primary">{successRate}%</span>
              </div>
              <Progress value={successRate} className="mt-2 h-3" />
            </CardContent>
          </Card>

          {/* History List */}
          <Card>
            <CardHeader>
              <CardTitle>
                Historique des prises
                <Badge variant="outline" className="ml-2">
                  {historyIntakes.length} prise(s)
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historyIntakes.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  Aucune prise trouvée pour cette période
                </p>
              ) : (
                <div className="space-y-3">
                  {historyIntakes.map((intake) => (
                    <div
                      key={intake.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            intake.taken ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        >
                          <Check className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold">
                            {intake.medicationName} {intake.dosage}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(intake.date), 'EEEE d MMMM', { locale: fr })} à {intake.time}
                          </p>
                        </div>
                      </div>
                      <Badge variant={intake.taken ? 'default' : 'destructive'}>
                        {intake.taken ? 'Pris' : 'Manqué'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Intake Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Saisir une prise</DialogTitle>
            <DialogDescription>
              Enregistrez une nouvelle prise de médicament
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="medication">Médicament *</Label>
              <Select
                value={formData.prescriptionId}
                onValueChange={(value) => setFormData({ ...formData, prescriptionId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un médicament" />
                </SelectTrigger>
                <SelectContent>
                  {mockPrescriptions.map((prescription) => (
                    <SelectItem key={prescription.id} value={prescription.id}>
                      {prescription.name} {prescription.dosage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Heure</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantité</Label>
              <Input
                id="quantity"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="Ex: 1 comprimé, 5ml..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Commentaire (optionnel)</Label>
              <Textarea
                id="comment"
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Effets ressentis, difficultés..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddIntake}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Intake Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la prise</DialogTitle>
            <DialogDescription>
              Modifiez les informations de la prise
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-medication">Médicament</Label>
              <Select
                value={formData.prescriptionId}
                onValueChange={(value) => setFormData({ ...formData, prescriptionId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un médicament" />
                </SelectTrigger>
                <SelectContent>
                  {mockPrescriptions.map((prescription) => (
                    <SelectItem key={prescription.id} value={prescription.id}>
                      {prescription.name} {prescription.dosage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-time">Heure</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-quantity">Quantité</Label>
              <Input
                id="edit-quantity"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-comment">Commentaire</Label>
              <Textarea
                id="edit-comment"
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditIntake}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la prise ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La prise sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteIntake}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Medications;
