import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Power } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T extends { id: string; is_active?: boolean }> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onToggleActive?: (item: T) => void;
}

export function DataTable<T extends { id: string; is_active?: boolean }>({
  data,
  columns,
  onEdit,
  onToggleActive,
}: DataTableProps<T>) {
  const getValue = (item: T, key: string): unknown => {
    const keys = key.split('.');
    let value: unknown = item;
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }
    return value;
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            {columns.map((column) => (
              <TableHead
                key={String(column.key)}
                className="font-semibold text-foreground"
              >
                {column.header}
              </TableHead>
            ))}
            {(onEdit || onToggleActive) && (
              <TableHead className="text-right font-semibold text-foreground">
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (onEdit || onToggleActive ? 1 : 0)}
                className="h-24 text-center text-muted-foreground"
              >
                Aucune donnée disponible
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow
                key={item.id}
                className="transition-colors hover:bg-muted/30"
              >
                {columns.map((column) => (
                  <TableCell key={String(column.key)}>
                    {column.render
                      ? column.render(item)
                      : String(getValue(item, String(column.key)) ?? '')}
                  </TableCell>
                ))}
                {(onEdit || onToggleActive) && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(item)}
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {onToggleActive && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onToggleActive(item)}
                          className={cn(
                            'h-8 w-8',
                            item.is_active
                              ? 'text-success hover:text-destructive'
                              : 'text-muted-foreground hover:text-success'
                          )}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export const StatusBadge: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <Badge
    variant={isActive ? 'default' : 'secondary'}
    className={cn(
      isActive
        ? 'bg-success/10 text-success hover:bg-success/20'
        : 'bg-muted text-muted-foreground'
    )}
  >
    {isActive ? 'Actif' : 'Inactif'}
  </Badge>
);
