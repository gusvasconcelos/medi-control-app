import React, { useState } from 'react';
import { Pressable, Text, View, Platform, Modal, useColorScheme } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar as CalendarIcon } from 'lucide-react-native';
import { Calendar } from 'react-native-calendars';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DatePickerProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  containerClassName?: string;
  placeholder?: string;
  allowClear?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
}

export function DatePicker({
  label,
  value,
  onChange,
  containerClassName = '',
  placeholder = 'Selecione uma data',
  allowClear = false,
  minimumDate,
  maximumDate,
}: DatePickerProps) {
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState<string>(
    value ? format(value, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  );
  const colorScheme = useColorScheme();

  // Android DateTimePicker handler
  const handleAndroidChange = (_event: any, selectedDate?: Date) => {
    setShow(false);
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  // iOS Calendar handler
  const handleDayPress = (day: { dateString: string }) => {
    setTempDate(day.dateString);
  };

  const handleConfirm = () => {
    const date = parse(tempDate, 'yyyy-MM-dd', new Date());
    onChange(date);
    setShow(false);
  };

  const handleCancel = () => {
    setShow(false);
    setTempDate(value ? format(value, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
  };

  const handleClear = () => {
    onChange(null);
  };

  const formattedDate = value
    ? format(value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : placeholder;

  // Format dates for Calendar component
  const minDate = minimumDate ? format(minimumDate, 'yyyy-MM-dd') : undefined;
  const maxDate = maximumDate ? format(maximumDate, 'yyyy-MM-dd') : undefined;

  return (
    <View className={containerClassName}>
      {label && (
        <Text className="mb-2 text-sm font-semibold text-foreground dark:text-dark-foreground">
          {label}
        </Text>
      )}

      <View className="flex-row gap-2">
        <Pressable
          onPress={() => {
            setTempDate(value || new Date());
            setShow(true);
          }}
          className="flex-1 flex-row items-center justify-between px-4 py-3.5 bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded-xl"
          style={{ minHeight: 52 }}
        >
          <Text
            className={`text-base ${
              value
                ? 'text-foreground dark:text-dark-foreground'
                : 'text-muted dark:text-dark-muted'
            }`}
          >
            {formattedDate}
          </Text>
          <CalendarIcon size={20} color="#6B7280" />
        </Pressable>

        {allowClear && value && (
          <Pressable
            onPress={handleClear}
            className="px-4 py-3.5 bg-destructive/10 border border-destructive rounded-xl items-center justify-center"
            style={{ minHeight: 52 }}
          >
            <Text className="text-sm font-medium text-destructive">Limpar</Text>
          </Pressable>
        )}
      </View>

      {show && Platform.OS === 'ios' && (
        <Modal
          visible={true}
          transparent
          animationType="slide"
          onRequestClose={handleCancel}
        >
          <Pressable
            className="flex-1 justify-end bg-black/50"
            onPress={handleCancel}
          >
            <Pressable className="bg-white dark:bg-dark-background rounded-t-3xl pb-6">
              {/* Header */}
              <View className="flex-row items-center justify-between px-4 py-3 border-b border-border dark:border-dark-border">
                <Pressable onPress={handleCancel}>
                  <Text className="text-base font-medium text-primary">Cancelar</Text>
                </Pressable>
                <Text className="text-base font-semibold text-foreground dark:text-dark-foreground">
                  {label || 'Selecionar Data'}
                </Text>
                <Pressable onPress={handleConfirm}>
                  <Text className="text-base font-semibold text-primary">Confirmar</Text>
                </Pressable>
              </View>

              {/* Calendar */}
              <Calendar
                current={tempDate}
                onDayPress={handleDayPress}
                markedDates={{
                  [tempDate]: { selected: true, selectedColor: '#0D7FFF' },
                }}
                minDate={minDate}
                maxDate={maxDate}
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

      {show && Platform.OS === 'android' && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display="default"
          onChange={handleAndroidChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  );
}
