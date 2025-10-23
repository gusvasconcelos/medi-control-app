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
import { Stack, useRouter } from 'expo-router';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, Text, useColorScheme, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

type ViewMode = 'day' | 'week' | 'month';

export default function CalendarScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [medications, setMedications] = useState<Medication.UserMedication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const iconColor = colorScheme === 'dark' ? '#E5E7EB' : '#1F2937';
  const mutedColor = colorScheme === 'dark' ? '#9CA3AF' : '#6B7280';

  useEffect(() => {
    loadMedications();
  }, [selectedDate, viewMode, user?.id]);

  const loadMedications = async () => {
    try {
      setIsLoading(true);

      // Retorna cedo se o usuário não está autenticado
      if (!user) {
        setMedications([]);
        return;
      }

      // Calcula as datas de início e fim baseadas no viewMode
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

      const data = await getUserMedications(params);
      setMedications(data);
    } catch (error) {
      console.error('Erro ao carregar medicamentos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Navega para a data anterior
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

  // Navega para a próxima data
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

  // Handler para mudança de data no picker (iOS)
  const handleDateChange = (day: { dateString: string }) => {
    const [year, month, dayNum] = day.dateString.split('-').map(Number);
    const newDate = new Date(year, month - 1, dayNum);
    setSelectedDate(newDate);
  };

  // Handler para Android DateTimePicker
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

  // Renderiza o seletor de data central
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
        className="flex-row items-center gap-2 px-4 py-2 rounded-full border border-border dark:border-dark-border bg-white dark:bg-dark-card"
      >
        <CalendarIcon size={18} color={iconColor} />
        <Text className="text-sm font-medium text-foreground dark:text-dark-foreground">
          {label}
        </Text>
        <ChevronRight size={16} color={mutedColor} />
      </Pressable>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Calendário',
          headerLeft: undefined,
          // headerRight: () => (
          //   <View className="flex-row items-center gap-4 mr-4">
          //     <Pressable className="relative">
          //       <Bell size={24} color={iconColor} />
          //       {/* Badge de notificação */}
          //       <View className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full items-center justify-center">
          //         <Text className="text-white text-xs font-bold">1</Text>
          //       </View>
          //     </Pressable>
          //     <Pressable className="w-10 h-10 bg-primary rounded-full items-center justify-center">
          //       <Text className="text-white text-sm font-bold">GV</Text>
          //     </Pressable>
          //   </View>
          // ),
          headerRight: undefined,
        }}
      />

      <View className="flex-1 bg-background dark:bg-dark-background">
        {/* Seletor de modo de visualização */}
        <View className="flex-row items-center justify-center gap-2 p-4 border-b border-border dark:border-dark-border">
          <Pressable
            onPress={() => setViewMode('day')}
            className={`flex-1 py-3 rounded-full ${
              viewMode === 'day'
                ? 'bg-primary'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            <Text
              className={`text-center text-sm font-semibold ${
                viewMode === 'day'
                  ? 'text-white'
                  : 'text-foreground dark:text-dark-foreground'
              }`}
            >
              Dia
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setViewMode('week')}
            className={`flex-1 py-3 rounded-full ${
              viewMode === 'week'
                ? 'bg-primary'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            <Text
              className={`text-center text-sm font-semibold ${
                viewMode === 'week'
                  ? 'text-white'
                  : 'text-foreground dark:text-dark-foreground'
              }`}
            >
              Semana
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setViewMode('month')}
            className={`flex-1 py-3 rounded-full ${
              viewMode === 'month'
                ? 'bg-primary'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            <Text
              className={`text-center text-sm font-semibold ${
                viewMode === 'month'
                  ? 'text-white'
                  : 'text-foreground dark:text-dark-foreground'
              }`}
            >
              Mês
            </Text>
          </Pressable>
        </View>

        {/* Navegação de data */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-border dark:border-dark-border">
          <Pressable
            onPress={goToPrevious}
            className="p-2 rounded-full border border-border dark:border-dark-border bg-white dark:bg-dark-card"
          >
            <ChevronLeft size={20} color={iconColor} />
          </Pressable>

          {renderDateSelector()}

          <Pressable
            onPress={goToNext}
            className="p-2 rounded-full border border-border dark:border-dark-border bg-white dark:bg-dark-card"
          >
            <ChevronRight size={20} color={iconColor} />
          </Pressable>
        </View>

        {/* Conteúdo principal */}
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

        {/* Botão flutuante de adicionar */}
        <Pressable
          onPress={() => router.push('/add-medication')}
          className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg"
        >
          <Plus size={28} color="white" />
        </Pressable>
      </View>

      {/* Modal do Calendário */}
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
              {/* Header */}
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

              {/* Calendar */}
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

      {/* DateTimePicker para Android */}
      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleAndroidDateChange}
        />
      )}
    </>
  );
}
