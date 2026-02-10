import React from 'react';
import { StatCard } from '@/components/StatCard';
import { mockDashboardStats, dependencyCategoryLabels } from '@/data/mockData';
import {
  Users,
  UserCheck,
  UserX,
  Link2,
  Shield,
  Heart,
  Activity,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

const COLORS = ['hsl(175, 45%, 40%)', 'hsl(210, 60%, 35%)', 'hsl(38, 92%, 50%)', 'hsl(152, 60%, 40%)', 'hsl(0, 72%, 51%)'];

const Dashboard: React.FC = () => {
  const stats = mockDashboardStats;

  const categoryData = Object.entries(stats.dependencyCategories).map(
    ([key, value]) => ({
      name: dependencyCategoryLabels[key] || key,
      value,
      percentage: Math.round(
        (value / Object.values(stats.dependencyCategories).reduce((a, b) => a + b, 0)) * 100
      ),
    })
  );

  const roleData = [
    
    {
      name: 'Caregivers',
      actif: stats.usersByRole.caregiver.active,
      inactif: stats.usersByRole.caregiver.inactive,
    },
    {
      name: 'Surveillés',
      actif: stats.usersByRole.dependent.active,
      inactif: stats.usersByRole.dependent.inactive,
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
        <p className="mt-2 text-muted-foreground">
          Vue d'ensemble du système de surveillance CareWatch
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Utilisateurs totaux"
          value={stats.totalUsers}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Caregivers actifs"
          value={stats.usersByRole.caregiver.active}
          subtitle={`sur ${stats.usersByRole.caregiver.total} au total`}
          icon={UserCheck}
          variant="accent"
        />
        <StatCard
          title="Surveillés actifs"
          value={stats.usersByRole.dependent.active}
          subtitle={`sur ${stats.usersByRole.dependent.total} au total`}
          icon={Heart}
          variant="success"
        />
        <StatCard
          title="Associations"
          value={stats.totalAssociations}
          subtitle="Caregiver ↔ Surveillé"
          icon={Link2}
          variant="warning"
        />
      </div>

   

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Distribution */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Activity className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                Catégories de dépendance
              </h3>
              <p className="text-sm text-muted-foreground">
                Répartition des surveillés par catégorie
              </p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} (${categoryData.find(d => d.name === name)?.percentage}%)`, name]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Users by Role */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                Utilisateurs par rôle
              </h3>
              <p className="text-sm text-muted-foreground">
                Statut d'activation par catégorie
              </p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                  }}
                />
                <Legend />
                <Bar dataKey="actif" fill="hsl(152, 60%, 40%)" name="Actifs" radius={[4, 4, 0, 0]} />
                <Bar dataKey="inactif" fill="hsl(215, 15%, 75%)" name="Inactifs" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
