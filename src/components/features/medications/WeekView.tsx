import type { Medication } from '@/src/@types';
import { getMedicationIndicators } from '@/src/api/services/user-medications';
import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  isToday,
  startOfWeek,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

interface WeekViewProps {
  medications: Medication.UserMedication[];
  selectedDate: Date;
  onDayPress?: (date: Date) => void;
}

interface DayStats {
  date: Date;
  total: number;
  taken: number;
}

export function WeekView({ medications, selectedDate, onDayPress }: WeekViewProps) {
  const [indicators, setIndicators] = useState<Map<string, Medication.DayIndicator>>(new Map());
  const [loading, setLoading] = useState(false);

  // Obtém os dias da semana
  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 0 }); // Domingo = 0
    const end = endOfWeek(selectedDate, { weekStartsOn: 0 });

    return eachDayOfInterval({ start, end });
  }, [selectedDate]);

  // Busca indicadores da API
  useEffect(() => {
    const fetchIndicators = async () => {
      try {
        setLoading(true);
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });

        const startDate = format(weekStart, 'yyyy-MM-dd');
        const endDate = format(weekEnd, 'yyyy-MM-dd');

        const data = await getMedicationIndicators({
          startDate,
          endDate,
        });

        const indicatorsMap = new Map<string, Medication.DayIndicator>();
        data.forEach((indicator) => {
          indicatorsMap.set(indicator.date, indicator);
        });

        setIndicators(indicatorsMap);
      } catch (error) {
        console.error('Erro ao buscar indicadores de medicamentos:', error);
        setIndicators(new Map());
      } finally {
        setLoading(false);
      }
    };

    fetchIndicators();
  }, [selectedDate]);

  // Calcula estatísticas para cada dia com base nos indicadores da API
  const weekStats = useMemo<DayStats[]>(() => {
    return weekDays.map((date) => {
      const dateString = format(date, 'yyyy-MM-dd');
      const indicator = indicators.get(dateString);

      return {
        date,
        total: indicator?.totalScheduled ?? 0,
        taken: indicator?.totalTaken ?? 0,
      };
    });
  }, [weekDays, indicators]);

  // Formata o título da semana
  const weekTitle = useMemo(() => {
    const weekNumber = format(selectedDate, 'w', { locale: ptBR });
    const year = format(selectedDate, 'yyyy');

    return `Semana ${weekNumber} de ${year}`;
  }, [selectedDate]);

  return (
    <ScrollView className="flex-1 bg-background dark:bg-dark-background">
      <View className="p-4">
        {/* Título da semana */}
        <Text className="text-xl font-semibold text-foreground dark:text-dark-foreground mb-6 text-center">
          {weekTitle}
        </Text>

        {/* Lista de dias da semana */}
        <View className="space-y-3">
          {weekStats.map((stats) => {
            const isSelected = isSameDay(stats.date, selectedDate);
            const isTodayDate = isToday(stats.date);
            const dayNumber = format(stats.date, 'd');
            const dayName = format(stats.date, 'EEE.', { locale: ptBR });

            return (
              <Pressable
                key={stats.date.toISOString()}
                onPress={() => onDayPress?.(stats.date)}
                className={`rounded-2xl border p-4 active:opacity-80 ${
                  isSelected
                    ? 'border-primary bg-primary/10 dark:bg-primary/20'
                    : isTodayDate
                    ? 'border-health bg-health/5 dark:bg-health/10'
                    : 'border-border dark:border-dark-border bg-white dark:bg-dark-card'
                }`}
              >
                <View className="flex-row items-center justify-between">
                  {/* Número e dia da semana */}
                  <View className="flex-row items-center gap-4">
                    <View className="relative">
                      <Text
                        className={`text-3xl font-bold ${
                          isSelected
                            ? 'text-primary'
                            : isTodayDate
                            ? 'text-health'
                            : 'text-foreground dark:text-dark-foreground'
                        }`}
                      >
                        {dayNumber}
                      </Text>
                      {isTodayDate && !isSelected && (
                        <View className="absolute -top-1 -right-1 w-2 h-2 bg-health rounded-full" />
                      )}
                    </View>
                    <Text
                      className={`text-sm ${
                        isSelected
                          ? 'text-primary'
                          : isTodayDate
                          ? 'text-health'
                          : 'text-muted dark:text-dark-muted'
                      }`}
                    >
                      {dayName}
                    </Text>

                    {/* Indicadores de status (bolinhas coloridas) */}
                    <View className="flex-row gap-1.5 ml-2">
                      {stats.taken === stats.total && (
                        <View className="w-2.5 h-2.5 rounded-full bg-health" />
                      )}
                      {stats.taken === 0 && stats.total > 0 && (
                        <View className="w-2.5 h-2.5 rounded-full bg-destructive" />
                      )}
                      {stats.taken > 0 && stats.taken < stats.total && (
                        <View className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                      )}
                    </View>
                  </View>

                  {/* Contagem de medicamentos */}
                  <View className="items-end">
                    <Text
                      className={`text-2xl font-bold ${
                        isSelected
                          ? 'text-primary'
                          : 'text-foreground dark:text-dark-foreground'
                      }`}
                    >
                      {stats.taken}/{stats.total}
                    </Text>
                    <Text
                      className={`text-xs ${
                        isSelected
                          ? 'text-primary'
                          : 'text-muted dark:text-dark-muted'
                      }`}
                    >
                      medicamentos
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
