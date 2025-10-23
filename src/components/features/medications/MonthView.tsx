import type { Medication } from '@/src/@types';
import { getMedicationIndicators } from '@/src/api/services/user-medications';
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

interface MonthViewProps {
  medications: Medication.UserMedication[];
  selectedDate: Date;
  onDayPress?: (date: Date) => void;
}

interface DayStats {
  date: Date;
  total: number;
  taken: number;
  isCurrentMonth: boolean;
}

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function MonthView({ medications, selectedDate, onDayPress }: MonthViewProps) {
  const [indicators, setIndicators] = useState<Map<string, Medication.DayIndicator>>(new Map());
  const [loading, setLoading] = useState(false);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);

    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [selectedDate]);

  // Busca indicadores da API
  useEffect(() => {
    const fetchIndicators = async () => {
      try {
        setLoading(true);
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);

        const startDate = format(monthStart, 'yyyy-MM-dd');
        const endDate = format(monthEnd, 'yyyy-MM-dd');

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
  const daysStats = useMemo<DayStats[]>(() => {
    return calendarDays.map((date) => {
      const dateString = format(date, 'yyyy-MM-dd');
      const indicator = indicators.get(dateString);

      return {
        date,
        total: indicator?.totalScheduled ?? 0,
        taken: indicator?.totalTaken ?? 0,
        isCurrentMonth: isSameMonth(date, selectedDate),
      };
    });
  }, [calendarDays, indicators, selectedDate]);

  // Agrupa os dias em semanas
  const weeks = useMemo(() => {
    const weeksArray: DayStats[][] = [];
    for (let i = 0; i < daysStats.length; i += 7) {
      weeksArray.push(daysStats.slice(i, i + 7));
    }
    return weeksArray;
  }, [daysStats]);

  // Formata o título do mês
  const monthTitle = useMemo(() => {
    const formatted = format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }, [selectedDate]);

  // Determina a cor da barra de status
  const getStatusBarColor = (stats: DayStats) => {
    if (stats.total === 0) return null;

    if (stats.taken === stats.total) return 'bg-health';
    if (stats.taken === 0) return 'bg-destructive';
    if (stats.taken > 0) return 'bg-yellow-500';

    return 'bg-destructive';
  };

  return (
    <ScrollView className="flex-1 bg-background dark:bg-dark-background">
      <View className="p-4">
        {/* Título do mês */}
        <Text className="text-xl font-semibold text-foreground dark:text-dark-foreground mb-6 text-center">
          {monthTitle}
        </Text>

        {/* Cabeçalho dos dias da semana */}
        <View className="flex-row mb-2">
          {WEEK_DAYS.map((day) => (
            <View key={day} className="flex-1 items-center">
              <Text className="text-xs font-medium text-muted dark:text-dark-muted">
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* Grade de dias */}
        <View className="space-y-1.5">
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} className="flex-row gap-1.5">
              {week.map((dayStats) => {
                const isSelected = isSameDay(dayStats.date, selectedDate);
                const isTodayDate = isToday(dayStats.date);
                const dayNumber = format(dayStats.date, 'd');
                const statusBarColor = getStatusBarColor(dayStats);

                return (
                  <Pressable
                    key={dayStats.date.toISOString()}
                    onPress={() => onDayPress?.(dayStats.date)}
                    className={`flex-1 min-h-[70px] rounded-lg border p-2 active:opacity-80 ${
                      isSelected
                        ? 'border-primary bg-primary/10 dark:bg-primary/20'
                        : isTodayDate
                        ? 'border-health bg-health/5 dark:bg-health/10'
                        : 'border-border dark:border-dark-border bg-white dark:bg-dark-card'
                    } ${!dayStats.isCurrentMonth ? 'opacity-40' : ''}`}
                  >
                    <View className="flex-1 justify-between items-center">
                      {/* Número do dia - centralizado */}
                      <View className="relative items-center justify-center flex-1 w-full">
                        <Text
                          className={`text-base font-semibold ${
                            isSelected
                              ? 'text-primary'
                              : isTodayDate
                              ? 'text-health'
                              : dayStats.isCurrentMonth
                              ? 'text-foreground dark:text-dark-foreground'
                              : 'text-muted dark:text-dark-muted'
                          }`}
                        >
                          {dayNumber}
                        </Text>
                        {isTodayDate && !isSelected && (
                          <View className="absolute top-0 right-0 w-1.5 h-1.5 bg-health rounded-full" />
                        )}
                      </View>

                      {/* Contador e barra de status - centralizados na parte inferior */}
                      {dayStats.total > 0 && (
                        <View className="items-center gap-0.5 w-full">
                          {/* Contador acima da barra */}
                          <Text
                            className={`text-[10px] font-bold leading-tight ${
                              isSelected
                                ? 'text-primary'
                                : isTodayDate
                                ? 'text-health'
                                : 'text-foreground dark:text-dark-foreground'
                            }`}
                          >
                            {dayStats.taken}/{dayStats.total}
                          </Text>
                          {/* Barra de status mais fina */}
                          {statusBarColor && (
                            <View
                              className={`w-full h-0.5 rounded-full ${statusBarColor}`}
                            />
                          )}
                        </View>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
