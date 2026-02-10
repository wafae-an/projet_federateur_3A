import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable, Column, StatusBadge } from '@/components/DataTable';
import { FormModal } from '@/components/FormModal';
import { Plus, Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { DependencyCategory } from '@/types';

const API_BASE_URL = 'http://localhost:8000';

const dependencyCategories: DependencyCategory[] = [
  'elderly', 'disability', 'chronic_disease', 'post_hospitalization',
  'social_vulnerability', 'cognitive_disorder', 'temporary_care', 'palliative_care'
];

const dependencyCategoryLabels: Record<string, string> = {
  elderly: 'Personnes âgées',
  disability: 'Handicap',
  chronic_disease: 'Maladie chronique',
  post_hospitalization: 'Post-hospitalisation',
  social_vulnerability: 'Vulnérabilité sociale',
  cognitive_disorder: 'Trouble cognitif',
  temporary_care: 'Soins temporaires',
  palliative_care: 'Soins palliatifs',
};

const Dependents: React.FC = () => {
  const [dependents, setDependents] = useState<any[]>([]);
  const [unassignedCaregivers, setUnassignedCaregivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDependent, setEditingDependent] = useState<any | null>(null);
  
  const [formData, setFormData] = useState<any>({
    email: '',
    password: '',
    full_name: '',
    age: '', // Initialisé à vide
    phone: '',
    address: '',
    dependency_category: 'elderly',
    caregiver_ids: [],
  });

  useEffect(() => {
    fetchDependents();
    fetchUnassignedCaregivers();
  }, []);

  const fetchDependents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/infoDependents/`);
      const data = await response.json();
      setDependents(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des surveillés");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnassignedCaregivers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/caregivers/unassigned`);
      const data = await response.json();
      setUnassignedCaregivers(data);
    } catch (error) {
      console.error("Erreur caregivers:", error);
    }
  };

  const handleOpenModal = (dependent?: any) => {
    if (dependent) {
      setEditingDependent(dependent);
      setFormData({
        email: dependent.email,
        password: '',
        full_name: dependent.full_name,
        age: dependent.age, // Récupération de l'âge existant
        phone: dependent.phone || '',
        address: dependent.address || '',
        dependency_category: dependent.dependency_category,
        caregiver_ids: dependent.caregivers?.map((c: any) => c.id) || [],
      });
    } else {
      setEditingDependent(null);
      setFormData({
        email: '',
        password: '',
        full_name: '',
        age: '', 
        phone: '',
        address: '',
        dependency_category: 'elderly',
        caregiver_ids: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingDependent 
      ? `${API_BASE_URL}/dependents/${editingDependent.id}` 
      : `${API_BASE_URL}/dependents/`;
    
    const method = editingDependent ? 'PUT' : 'POST';

    // Conversion de l'âge en nombre pour l'API
    const payload = {
      ...formData,
      age: parseInt(formData.age, 10)
    };

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error();

      toast.success(editingDependent ? 'Surveillé mis à jour' : 'Surveillé créé');
      setIsModalOpen(false);
      fetchDependents();
      fetchUnassignedCaregivers();
    } catch (error) {
      toast.error("Une erreur est survenue lors de l'enregistrement");
    }
  };

  const handleToggleActive = async (dependent: any) => {
    if (!dependent.is_active) {
       toast.info("La réactivation n'est pas gérée par cet endpoint PATCH");
       return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/dependents/${dependent.id}/deactivate`, {
        method: 'PATCH',
      });
      if (response.ok) {
        toast.success(`Compte de ${dependent.full_name} désactivé`);
        fetchDependents();
      }
    } catch (error) {
      toast.error("Erreur lors de la désactivation");
    }
  };

  const toggleCaregiver = (id: number) => {
    setFormData((prev: any) => ({
      ...prev,
      caregiver_ids: prev.caregiver_ids.includes(id)
        ? prev.caregiver_ids.filter((cId: number) => cId !== id)
        : [...prev.caregiver_ids, id],
    }));
  };

  const columns: Column<any>[] = [
    { key: 'full_name', header: 'Nom complet' },
    { key: 'age', header: 'Âge', render: (d) => <span>{d.age} ans</span> }, // Nouvelle colonne Âge
    { key: 'email', header: 'Email' },
    {
      key: 'dependency_category',
      header: 'Catégorie',
      render: (d) => (
        <Badge variant="secondary">
          {dependencyCategoryLabels[d.dependency_category] || d.dependency_category}
        </Badge>
      ),
    },
    {
      key: 'caregivers',
      header: 'Caregivers',
      render: (d) => (
        <div className="flex flex-wrap gap-1">
          {d.caregivers?.map((cg: any) => (
            <Badge key={cg.id} variant="outline" className="text-[10px]">
              {cg.full_name}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'is_active',
      header: 'Statut',
      render: (d) => <StatusBadge isActive={d.is_active} />,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Surveillés</h1>
          <p className="mt-2 text-muted-foreground">Administration des profils dépendants</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus className="h-4 w-4" /> Ajouter un surveillé
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>
      ) : (
        <DataTable data={dependents} columns={columns} onEdit={handleOpenModal} onToggleActive={handleToggleActive} />
      )}

      <FormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={editingDependent ? 'Modifier le surveillé' : 'Créer un surveillé'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* NOM ET AGE SUR LA MÊME LIGNE */}
          <div className="grid gap-4 grid-cols-4">
            <div className="col-span-3 space-y-2">
              <Label htmlFor="full_name">Nom complet</Label>
              <Input 
                id="full_name"
                value={formData.full_name} 
                onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
                placeholder="Ex: Jean Dupont"
                required 
              />
            </div>
            <div className="col-span-1 space-y-2">
              <Label htmlFor="age">Âge</Label>
              <Input 
                id="age"
                type="number"
                value={formData.age} 
                onChange={(e) => setFormData({...formData, age: e.target.value})} 
                placeholder="Ex: 85"
                required 
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                type="email" 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                Mot de passe {editingDependent && "(optionnel)"}
              </Label>
              <Input 
                id="password"
                type="password" 
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                required={!editingDependent} 
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input 
                id="phone"
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Catégorie de dépendance</Label>
              <Select 
                value={formData.dependency_category} 
                onValueChange={(v) => setFormData({...formData, dependency_category: v})}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {dependencyCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{dependencyCategoryLabels[cat]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Caregivers disponibles (non assignés)</Label>
            <div className="grid gap-2 border rounded-md p-3 max-h-32 overflow-y-auto bg-muted/20">
              {unassignedCaregivers.length === 0 && (
                <p className="text-xs text-muted-foreground italic">Aucun aidant disponible</p>
              )}
              
              {unassignedCaregivers.map((cg) => (
                <div key={cg.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`cg-${cg.id}`} 
                    checked={formData.caregiver_ids.includes(cg.id)} 
                    onCheckedChange={() => toggleCaregiver(cg.id)} 
                  />
                  <label htmlFor={`cg-${cg.id}`} className="text-sm cursor-pointer">{cg.full_name}</label>
                </div>
              ))}

              {editingDependent?.caregivers?.map((cg: any) => (
                 <div key={cg.id} className="flex items-center space-x-2 border-l-2 border-primary pl-2">
                   <Checkbox 
                      id={`cg-${cg.id}`} 
                      checked={formData.caregiver_ids.includes(cg.id)} 
                      onCheckedChange={() => toggleCaregiver(cg.id)} 
                    />
                   <label htmlFor={`cg-${cg.id}`} className="text-sm font-semibold cursor-pointer">
                     {cg.full_name} <Badge variant="outline" className="ml-1 text-[9px] uppercase">Assigné</Badge>
                   </label>
                 </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" className="flex-1 gap-2">
              <Heart className="h-4 w-4" />
              {editingDependent ? 'Enregistrer les modifications' : 'Créer le profil'}
            </Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};

export default Dependents;