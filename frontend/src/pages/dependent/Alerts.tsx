import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertTriangle, CheckCircle, Info, ShieldCheck, Brain, Clock, Bell } from 'lucide-react';
import { mockAlerts } from '@/data/dependentMockData';
import { Alert, ANOMALY_TYPES, SEVERITY_LEVELS, AlertSeverity } from '@/types/dependent';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function Alerts() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const { toast } = useToast();

  const unacknowledgedAlerts = alerts.filter(a => !a.isAcknowledged);
  const acknowledgedAlerts = alerts.filter(a => a.isAcknowledged);

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, isAcknowledged: true } : alert
      )
    );
    toast({
      title: '✅ Alerte vérifiée',
      description: 'L\'alerte a été marquée comme vérifiée.',
    });
  };

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-700" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'low':
        return <Info className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          🚨 Activités Anormales
        </h1>
        <p className="text-muted-foreground">
          Situations inhabituelles détectées par le système
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className={cn(
          'border-l-4',
          unacknowledgedAlerts.length > 0 ? 'border-l-red-500' : 'border-l-green-500'
        )}>
          <CardContent className="flex items-center gap-4 py-4">
            <div className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full',
              unacknowledgedAlerts.length > 0 ? 'bg-red-100' : 'bg-green-100'
            )}>
              {unacknowledgedAlerts.length > 0 ? (
                <Bell className="h-6 w-6 text-red-500" />
              ) : (
                <CheckCircle className="h-6 w-6 text-green-500" />
              )}
            </div>
            <div>
              <p className="text-2xl font-bold">{unacknowledgedAlerts.length}</p>
              <p className="text-sm text-muted-foreground">À vérifier</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <ShieldCheck className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{acknowledgedAlerts.length}</p>
              <p className="text-sm text-muted-foreground">Vérifiées</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{alerts.length}</p>
              <p className="text-sm text-muted-foreground">Total détectées</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for alerts */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            À vérifier
            {unacknowledgedAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {unacknowledgedAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="acknowledged">Vérifiées</TabsTrigger>
          <TabsTrigger value="all">Toutes</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <AlertsList
            alerts={unacknowledgedAlerts}
            onAcknowledge={handleAcknowledge}
            emptyMessage="🎉 Aucune alerte en attente de vérification"
          />
        </TabsContent>

        <TabsContent value="acknowledged">
          <AlertsList
            alerts={acknowledgedAlerts}
            emptyMessage="Aucune alerte vérifiée"
          />
        </TabsContent>

        <TabsContent value="all">
          <AlertsList
            alerts={alerts}
            onAcknowledge={handleAcknowledge}
            emptyMessage="Aucune alerte détectée"
          />
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Brain className="mt-0.5 h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-900">Comment fonctionne la détection ?</h3>
              <p className="mt-1 text-sm text-blue-800">
                Notre système intelligent apprend votre <strong>routine habituelle</strong> et 
                compare le <strong>comportement observé</strong> pour détecter les écarts significatifs. 
                Ces alertes sont informatives et visent à s'assurer de votre bien-être.
              </p>
              <p className="mt-2 text-sm text-blue-600 italic">
                💙 Aucun contenu intrusif n'est utilisé (pas de caméra, pas de micro).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface AlertsListProps {
  alerts: Alert[];
  onAcknowledge?: (id: string) => void;
  emptyMessage: string;
}

function AlertsList({ alerts, onAcknowledge, emptyMessage }: AlertsListProps) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-green-500" />
          <p className="mt-4 text-lg text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  // Sort by severity (critical first) and then by date
  const sortedAlerts = [...alerts].sort((a, b) => {
    const severityOrder: Record<AlertSeverity, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
  });

  return (
    <div className="space-y-4">
      {sortedAlerts.map(alert => (
        <AlertCard key={alert.id} alert={alert} onAcknowledge={onAcknowledge} />
      ))}
    </div>
  );
}

interface AlertCardProps {
  alert: Alert;
  onAcknowledge?: (id: string) => void;
}

function AlertCard({ alert, onAcknowledge }: AlertCardProps) {
  const anomalyInfo = ANOMALY_TYPES[alert.type];
  const severityInfo = SEVERITY_LEVELS[alert.severity];

  const getSeverityBorderColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return 'border-l-red-700';
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-orange-500';
      case 'low':
        return 'border-l-yellow-500';
    }
  };

  const getSeverityBgColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50';
      case 'high':
        return 'bg-red-50/50';
      case 'medium':
        return 'bg-orange-50';
      case 'low':
        return 'bg-yellow-50';
    }
  };

  return (
    <Card
      className={cn(
        'border-l-4 transition-all',
        getSeverityBorderColor(alert.severity),
        getSeverityBgColor(alert.severity),
        alert.isAcknowledged && 'opacity-70'
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{anomalyInfo.icon}</span>
            <div>
              <CardTitle className="text-lg">{anomalyInfo.label}</CardTitle>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {format(new Date(alert.detectedAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                </span>
                <span className="text-xs">
                  ({formatDistanceToNow(new Date(alert.detectedAt), { addSuffix: true, locale: fr })})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={cn(severityInfo.color, 'text-white')}>
              {severityInfo.label}
            </Badge>
            {alert.isAcknowledged && (
              <Badge variant="outline" className="border-green-500 text-green-600">
                <CheckCircle className="mr-1 h-3 w-3" />
                Vérifiée
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-foreground">{alert.description}</p>

        <div className="rounded-lg bg-background/80 p-3">
          <div className="flex items-start gap-2">
            <Brain className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Cause probable :</p>
              <p className="text-sm text-muted-foreground">{alert.probableCause}</p>
            </div>
          </div>
        </div>

        {!alert.isAcknowledged && onAcknowledge && (
          <div className="flex flex-col gap-3 rounded-lg bg-background p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground italic">
              💡 Une vérification est recommandée
            </p>
            <Button
              onClick={() => onAcknowledge(alert.id)}
              variant="outline"
              className="gap-2 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
            >
              <CheckCircle className="h-4 w-4" />
              Marquer comme vérifiée
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
