import React, { useEffect, useState } from 'react';
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
import { DataTable, Column, StatusBadge } from '@/components/DataTable';
import { FormModal } from '@/components/FormModal';
import { Plus, UserCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { 
  Caregiver, 
  CreateCaregiverData, 
  RelationshipType, 
  RELATIONSHIP_OPTIONS,
  getRelationshipLabel 
} from '@/types';

const API_URL = 'http://localhost:8000';

// Type pour le formulaire qui permet une chaîne vide
type CaregiverFormData = {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  address: string;
  profession: string;
  relationship_type: RelationshipType | ''; // Permettre une chaîne vide
  role: 'caregiver';
};

const Caregivers: React.FC = () => {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCaregiver, setEditingCaregiver] = useState<Caregiver | null>(null);

  const [formData, setFormData] = useState<CaregiverFormData>({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    address: '',
    profession: '',
    relationship_type: '',
    role: 'caregiver',
  });

  /* ================= FETCH ================= */

  const fetchCaregivers = async () => {
    try {
      const res = await fetch(`${API_URL}/caregivers`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCaregivers(data);
    } catch {
      toast({ title: 'Erreur', description: 'Chargement impossible', variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchCaregivers();
  }, []);

  /* ================= TABLE ================= */

  const columns: Column<Caregiver>[] = [
    { key: 'email', header: 'Email' },
    { key: 'full_name', header: 'Nom complet' },
    { key: 'phone', header: 'Téléphone' },
    { key: 'address', header: 'Adresse' },
    { key: 'profession', header: 'Profession' },
    {
      key: 'relationship_type',
      header: 'Relation',
      render: (c) => getRelationshipLabel(c.relationship_type || ''),
    },
    {
      key: 'is_active',
      header: 'Statut',
      render: (c) => <StatusBadge isActive={c.is_active} />,
    },
  ];

  /* ================= MODALE ================= */

  const openModal = (caregiver?: Caregiver) => {
    if (caregiver) {
      setEditingCaregiver(caregiver);
      setFormData({
        email: caregiver.email,
        full_name: caregiver.full_name,
        phone: caregiver.phone || '',
        address: caregiver.address || '',
        profession: caregiver.profession || '',
        relationship_type: (caregiver.relationship_type as RelationshipType) || '',
        password: '', // ❌ jamais rempli en édition
        role: 'caregiver',
      });
    } else {
      setEditingCaregiver(null);
      setFormData({
        email: '',
        password: '',
        full_name: '',
        phone: '',
        address: '',
        profession: '',
        relationship_type: '',
        role: 'caregiver',
      });
    }
    setIsModalOpen(true);
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Préparer les données pour l'API
      const apiData = {
        ...formData,
        // Convertir la chaîne vide en undefined pour l'API
        relationship_type: formData.relationship_type || undefined,
      };

      if (editingCaregiver) {
        // ✅ UPDATE PARTIEL (UserUpdate)
        const updateData = {
          full_name: formData.full_name || undefined,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          address: formData.address || undefined,
          profession: formData.profession || undefined,
          relationship_type: formData.relationship_type || undefined,
        };

        const res = await fetch(`${API_URL}/caregivers/${editingCaregiver.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });

        if (!res.ok) throw new Error();

        toast({ title: 'Succès', description: 'Caregiver modifié' });
        fetchCaregivers();
      } else {
        // ✅ CREATE - N'envoyer que les champs non vides
        const createData = {
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
          profession: formData.profession || undefined,
          relationship_type: formData.relationship_type || undefined,
          role: 'caregiver' as const,
        };

        const res = await fetch(`${API_URL}/caregivers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createData),
        });

        if (!res.ok) throw new Error();

        toast({ title: 'Succès', description: 'Caregiver créé' });
        fetchCaregivers();
      }

      setIsModalOpen(false);
    } catch {
      toast({ title: 'Erreur', description: 'Opération échouée', variant: 'destructive' });
    }
  };

  /* ================= ACTIVATE / DEACTIVATE ================= */

  const toggleActive = async (caregiver: Caregiver) => {
    try {
      const res = await fetch(`${API_URL}/caregivers/${caregiver.id}/deactivate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !caregiver.is_active }),
      });

      if (!res.ok) throw new Error();

      toast({
        title: caregiver.is_active ? 'Compte désactivé' : 'Compte activé',
      });

      fetchCaregivers();
    } catch {
      toast({ title: 'Erreur', description: 'Action impossible', variant: 'destructive' });
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Gestion des caregivers</h1>
        <Button onClick={() => openModal()} className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter
        </Button>
      </div>

      <DataTable
        data={caregivers}
        columns={columns}
        onEdit={openModal}
        onToggleActive={toggleActive}
      />

      <FormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={editingCaregiver ? 'Modifier caregiver' : 'Ajouter caregiver'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField 
            label="Nom complet" 
            value={formData.full_name} 
            onChange={(v) => setFormData({ ...formData, full_name: v })} 
            required
          />
          
          <InputField 
            label="Email" 
            type="email"
            value={formData.email} 
            onChange={(v) => setFormData({ ...formData, email: v })} 
            required
          />
          
          {!editingCaregiver && (
            <InputField 
              label="Mot de passe" 
              type="password" 
              value={formData.password} 
              onChange={(v) => setFormData({ ...formData, password: v })} 
              required
            />
          )}
          
          <InputField 
            label="Téléphone" 
            type="tel"
            value={formData.phone} 
            onChange={(v) => setFormData({ ...formData, phone: v })} 
          />
          
          <InputField 
            label="Adresse" 
            value={formData.address} 
            onChange={(v) => setFormData({ ...formData, address: v })} 
          />
          
          <InputField 
            label="Profession" 
            value={formData.profession} 
            onChange={(v) => setFormData({ ...formData, profession: v })} 
          />
          
          {/* Champ Relation avec liste déroulante */}
          <div className="space-y-2">
            <Label htmlFor="relationship_type">Relation</Label>
            <Select
              value={formData.relationship_type}
              onValueChange={(value: string) => 
                setFormData({ 
                  ...formData, 
                  relationship_type: value as RelationshipType | '' 
                })
              }
            >
              <SelectTrigger id="relationship_type">
                <SelectValue placeholder="Sélectionner une relation" />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIP_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full gap-2 mt-4">
            <UserCheck className="h-4 w-4" />
            {editingCaregiver ? 'Modifier' : 'Créer'}
          </Button>
        </form>
      </FormModal>
    </div>
  );
};

/* ================= REUSABLE INPUT ================= */

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  
  required?: boolean;
}

const InputField = ({ label, value, onChange, type = 'text', required = false }: InputFieldProps) => (
  <div className="space-y-2">
    <Label htmlFor={label.replace(/\s+/g, '-').toLowerCase()}>
      {label}
      {required && <span className="text-destructive ml-1">*</span>}
    </Label>
    <Input 
      id={label.replace(/\s+/g, '-').toLowerCase()}
      type={type} 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      required={required}
    />
  </div>
);

export default Caregivers;