import type { Medication } from '@/src/@types';
import { getUserMedications } from '@/src/api/services';
import { DayView, MonthView, WeekView } from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  addDays,
  addMonths,
  addWeeks,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'expo-router';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, Text, useColorScheme, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ViewMode = 'day' | 'week' | 'month';

export default function CalendarScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [medications, setMedications] = useState<Medication.UserMedication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const iconColor = colorScheme === 'dark' ? '#E5E7EB' : '#1F2937';

  useEffect(() => {
    loadMedications();
  }, [selectedDate, viewMode, user?.id]);

  const loadMedications = async () => {
    try {
      setIsLoading(true);

      if (!user) {
        setMedications([]);
        return;
      }

      let startDate: Date;
      let endDate: Date;

      switch (viewMode) {
        case 'day':
          startDate = startOfDay(selectedDate);
          endDate = endOfDay(selectedDate);
          break;
        case 'week':
          startDate = startOfWeek(selectedDate, { weekStartsOn: 0 });
          endDate = endOfWeek(selectedDate, { weekStartsOn: 0 });
          break;
        case 'month':
          startDate = startOfMonth(selectedDate);
          endDate = endOfMonth(selectedDate);
          break;
      }

      const params: Medication.GetUserMedicationsParams = {
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
      };

      const medicationsResponse = await getUserMedications(params);
      setMedications(medicationsResponse.data);
    } catch (error) {
      console.error('Erro ao carregar medicamentos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const goToPrevious = () => {
    switch (viewMode) {
      case 'day':
        setSelectedDate((prev) => subDays(prev, 1));
        break;
      case 'week':
        setSelectedDate((prev) => subWeeks(prev, 1));
        break;
      case 'month':
        setSelectedDate((prev) => subMonths(prev, 1));
        break;
    }
  };

  const goToNext = () => {
    switch (viewMode) {
      case 'day':
        setSelectedDate((prev) => addDays(prev, 1));
        break;
      case 'week':
        setSelectedDate((prev) => addWeeks(prev, 1));
        break;
      case 'month':
        setSelectedDate((prev) => addMonths(prev, 1));
        break;
    }
  };

  const handleDateChange = (day: { dateString: string }) => {
    const [year, month, dayNum] = day.dateString.split('-').map(Number);
    const newDate = new Date(year, month - 1, dayNum);
    setSelectedDate(newDate);
  };

  const handleAndroidDateChange = (_event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleConfirmDate = () => {
    setShowDatePicker(false);
  };

  const handleCancelDate = () => {
    setShowDatePicker(false);
  };

  const renderDateSelector = () => {
    let label = '';

    switch (viewMode) {
      case 'day':
        label = format(selectedDate, "dd 'de' MMM", { locale: ptBR });
        break;
      case 'week':
        const weekNumber = format(selectedDate, 'I', { locale: ptBR });
        label = `Semana ${weekNumber} de ${format(selectedDate, 'yyyy')}`;
        break;
      case 'month':
        const monthYear = format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR });
        label = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
        break;
    }

    return (
      <Pressable
        onPress={() => setShowDatePicker(true)}
        className="flex-row items-center gap-2 px-3 py-1.5 active:opacity-50"
      >
        <CalendarIcon size={16} color={iconColor} />
        <Text className="text-base font-medium text-foreground dark:text-dark-foreground">
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-background dark:bg-dark-background">
        {/* View Mode Selector - Simplified */}
        <View className="flex-row items-center justify-center gap-1 px-4 pt-3 pb-2">
          <Pressable
            onPress={() => setViewMode('day')}
            className={`flex-1 py-2.5 rounded-lg ${
              viewMode === 'day'
                ? 'bg-primary/10'
                : ''
            }`}
          >
            <Text
              className={`text-center text-sm font-medium ${
                viewMode === 'day'
                  ? 'text-primary'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Dia
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setViewMode('week')}
            className={`flex-1 py-2.5 rounded-lg ${
              viewMode === 'week'
                ? 'bg-primary/10'
                : ''
            }`}
          >
            <Text
              className={`text-center text-sm font-medium ${
                viewMode === 'week'
                  ? 'text-primary'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Semana
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setViewMode('month')}
            className={`flex-1 py-2.5 rounded-lg ${
              viewMode === 'month'
                ? 'bg-primary/10'
                : ''
            }`}
          >
            <Text
              className={`text-center text-sm font-medium ${
                viewMode === 'month'
                  ? 'text-primary'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Mês
            </Text>
          </Pressable>
        </View>

        {/* Date Navigation - Simplified */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <Pressable
            onPress={goToPrevious}
            className="p-2 active:opacity-50"
          >
            <ChevronLeft size={24} color={iconColor} />
          </Pressable>

          {renderDateSelector()}

          <Pressable
            onPress={goToNext}
            className="p-2 active:opacity-50"
          >
            <ChevronRight size={24} color={iconColor} />
          </Pressable>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#0D7FFF" />
          </View>
        ) : (
          <>
            {viewMode === 'day' && (
              <DayView
                medications={medications}
                selectedDate={selectedDate}
                onMedicationPress={(medication, log) => {
                  console.log('Medicamento pressionado:', medication.id, log?.id);
                }}
              />
            )}

            {viewMode === 'week' && (
              <WeekView
                medications={medications}
                selectedDate={selectedDate}
                onDayPress={(date) => {
                  setSelectedDate(date);
                  setViewMode('day');
                }}
              />
            )}

            {viewMode === 'month' && (
              <MonthView
                medications={medications}
                selectedDate={selectedDate}
                onDayPress={(date) => {
                  setSelectedDate(date);
                  setViewMode('day');
                }}
              />
            )}
          </>
        )}

        <Pressable
          onPress={() => router.push('/add-medication')}
          className="absolute right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg"
          style={{ bottom: Math.max(24, insets.bottom + 24) }}
        >
          <Plus size={28} color="white" />
        </Pressable>

        {showDatePicker && Platform.OS === 'ios' && (
        <Modal
          visible={true}
          transparent
          animationType="slide"
          onRequestClose={handleCancelDate}
        >
          <Pressable
            className="flex-1 justify-end bg-black/50"
            onPress={handleCancelDate}
          >
            <Pressable className="bg-white dark:bg-dark-background rounded-t-3xl pb-6">
              <View className="flex-row items-center justify-between px-4 py-3 border-b border-border dark:border-dark-border">
                <Pressable onPress={handleCancelDate}>
                  <Text className="text-base font-medium text-primary">Cancelar</Text>
                </Pressable>
                <Text className="text-base font-semibold text-foreground dark:text-dark-foreground">
                  Selecionar Data
                </Text>
                <Pressable onPress={handleConfirmDate}>
                  <Text className="text-base font-semibold text-primary">Confirmar</Text>
                </Pressable>
              </View>

              <Calendar
                current={format(selectedDate, 'yyyy-MM-dd')}
                onDayPress={handleDateChange}
                markedDates={{
                  [format(selectedDate, 'yyyy-MM-dd')]: {
                    selected: true,
                    selectedColor: '#0D7FFF'
                  },
                }}
                monthFormat={'MMMM yyyy'}
                hideExtraDays={false}
                firstDay={0}
                enableSwipeMonths={true}
                theme={{
                  backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
                  calendarBackground: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
                  textSectionTitleColor: colorScheme === 'dark' ? '#9CA3AF' : '#6B7280',
                  selectedDayBackgroundColor: '#0D7FFF',
                  selectedDayTextColor: '#FFFFFF',
                  todayTextColor: '#0D7FFF',
                  dayTextColor: colorScheme === 'dark' ? '#E5E7EB' : '#1F2937',
                  textDisabledColor: colorScheme === 'dark' ? '#4B5563' : '#D1D5DB',
                  monthTextColor: colorScheme === 'dark' ? '#E5E7EB' : '#1F2937',
                  textMonthFontWeight: '600',
                  textDayFontSize: 16,
                  textMonthFontSize: 18,
                }}
              />
            </Pressable>
          </Pressable>
        </Modal>
        )}

        {showDatePicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleAndroidDateChange}
          />
        )}
      </View>
    );
  }
