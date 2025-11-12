import type { Medication } from '@/src/@types';
import { getUserMedications } from '@/src/api/services';
import { DayView } from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addDays, endOfDay, format, startOfDay, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useFocusEffect, useRouter } from 'expo-router';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, Text, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CalendarScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [medications, setMedications] = useState<Medication.UserMedication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const iconColor = colorScheme === 'dark' ? '#E5E7EB' : '#1F2937';

  const loadMedications = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!user) {
        setMedications([]);
        return;
      }

      const startDate = startOfDay(selectedDate);
      const endDate = endOfDay(selectedDate);

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
  }, [selectedDate, user]);

  useFocusEffect(
    useCallback(() => {
      loadMedications();
    }, [loadMedications]),
  );

  useEffect(() => {
    loadMedications();
  }, [loadMedications]);

  const goToPrevious = () => {
    setSelectedDate((prev) => subDays(prev, 1));
  };

  const goToNext = () => {
    setSelectedDate((prev) => addDays(prev, 1));
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'dismissed' || event.type === 'neutralButtonPressed') {
        return;
      }
    }

    if (date) {
      setSelectedDate(date);
    }
  };

  const renderDateSelector = () => {
    const label = format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

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
      {/* Date Navigation */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-border dark:border-dark-border">
        <Pressable onPress={goToPrevious} className="p-2 active:opacity-50">
          <ChevronLeft size={24} color={iconColor} />
        </Pressable>

        {renderDateSelector()}

        <Pressable onPress={goToNext} className="p-2 active:opacity-50">
          <ChevronRight size={24} color={iconColor} />
        </Pressable>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0D7FFF" />
        </View>
      ) : (
        <DayView
          medications={medications}
          selectedDate={selectedDate}
          onMedicationPress={(medication, log) => {
            console.log('Medicamento pressionado:', medication.id, log?.id);
          }}
          onRefresh={loadMedications}
        />
      )}

      {!showDatePicker && (
        <Pressable
          onPress={() => router.push('/add-medication')}
          className="absolute right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg"
          style={{ bottom: Math.max(24, insets.bottom + 24) }}
        >
          <Plus size={28} color="white" />
        </Pressable>
      )}

      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {Platform.OS === 'ios' && showDatePicker && (
        <Modal transparent animationType="slide" visible={showDatePicker}>
          <Pressable
            className="flex-1 justify-end bg-black/50"
            onPress={() => setShowDatePicker(false)}
          >
            <Pressable className="bg-white dark:bg-dark-card rounded-t-3xl">
              <View className="flex-row items-center px-4 py-3 border-b border-border dark:border-dark-border">
                <Pressable onPress={() => setShowDatePicker(false)} className="flex-1">
                  <Text className="text-base font-medium text-primary">Cancelar</Text>
                </Pressable>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground dark:text-dark-foreground text-center">
                    Selecionar Data
                  </Text>
                </View>
                <Pressable
                  onPress={() => {
                    setShowDatePicker(false);
                  }}
                  className="flex-1"
                >
                  <Text className="text-base font-semibold text-primary text-right">OK</Text>
                </Pressable>
              </View>
              <View className="items-center py-4">
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  locale="pt-BR"
                  textColor={colorScheme === 'dark' ? '#FFFFFF' : '#000000'}
                  style={{ width: '100%' }}
                />
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}
