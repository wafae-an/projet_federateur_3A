import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Brain, User, Clock } from 'lucide-react';
import { mockTimelineEvents } from '@/data/dependentMockData';
import { ACTIVITY_CATEGORIES, TimelineEvent } from '@/types/dependent';
import { cn } from '@/lib/utils';

export default function Timeline() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const formattedDate = format(selectedDate, 'yyyy-MM-dd');
  const isToday = formattedDate === new Date().toISOString().split('T')[0];

  // Filter events for selected date and sort by time
  const dayEvents = mockTimelineEvents
    .filter(event => event.date === formattedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const predictedCount = dayEvents.filter(e => e.source === 'predicted').length;
  const manualCount = dayEvents.filter(e => e.source === 'manual').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            📊 Timeline de la journée
          </h1>
          <p className="text-muted-foreground">
            Vue chronologique de vos activités
          </p>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={fr}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm">
              <strong>{predictedCount}</strong> activités prédites
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/20">
              <User className="h-4 w-4 text-success" />
            </div>
            <span className="text-sm">
              <strong>{manualCount}</strong> activités saisies
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {isToday ? "Aujourd'hui" : format(selectedDate, 'EEEE dd MMMM', { locale: fr })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dayEvents.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-lg">Aucune activité pour cette journée</p>
            </div>
          ) : (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 top-0 h-full w-0.5 bg-border" />

              <div className="space-y-6">
                {dayEvents.map((event, index) => (
                  <TimelineItem key={event.id} event={event} isLast={index === dayEvents.length - 1} />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Brain className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold text-foreground">Comment fonctionne la timeline ?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Les activités <strong>prédites</strong> sont générées par notre système intelligent 
                qui apprend votre routine quotidienne. Les activités <strong>saisies</strong> sont 
                celles que vous avez déclarées vous-même. Cette combinaison permet une meilleure 
                compréhension de votre journée.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface TimelineItemProps {
  event: TimelineEvent;
  isLast: boolean;
}

function TimelineItem({ event, isLast }: TimelineItemProps) {
  const categoryInfo = ACTIVITY_CATEGORIES[event.category];
  const isPredicted = event.source === 'predicted';

  return (
    <div className="relative flex gap-4 pl-12">
      {/* Timeline dot */}
      <div
        className={cn(
          'absolute left-4 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border-2 border-background',
          isPredicted ? 'bg-primary' : 'bg-success'
        )}
      >
        {isPredicted ? (
          <Brain className="h-3 w-3 text-primary-foreground" />
        ) : (
          <User className="h-3 w-3 text-success-foreground" />
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          'flex-1 rounded-lg border p-4 transition-colors',
          isPredicted
            ? 'border-primary/30 bg-primary/5 hover:bg-primary/10'
            : 'border-success/30 bg-success/5 hover:bg-success/10'
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{categoryInfo.icon}</span>
            <div>
              <p className="font-medium text-foreground">{event.description}</p>
              <p className="text-sm text-muted-foreground">{categoryInfo.label}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <Badge variant="outline" className="text-base font-semibold">
              {event.time}
            </Badge>
            <Badge
              variant={isPredicted ? 'default' : 'secondary'}
              className={cn(
                'text-xs',
                isPredicted
                  ? 'bg-primary/20 text-primary hover:bg-primary/30'
                  : 'bg-success/20 text-success hover:bg-success/30'
              )}
            >
              {isPredicted ? '🤖 Prédite' : '✍️ Saisie'}
            </Badge>
          </div>
        </div>

        {/* Confidence indicator for predicted activities */}
        {isPredicted && event.confidence && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Confiance :</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${event.confidence}%` }}
              />
            </div>
            <span className="text-xs font-medium text-primary">{event.confidence}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
