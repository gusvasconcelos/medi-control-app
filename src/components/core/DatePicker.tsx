import React, { useState } from 'react';
import { Modal, Platform, Pressable, Text, useColorScheme, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar as CalendarIcon } from 'lucide-react-native';
import { format } from 'date-fns';
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
  const colorScheme = useColorScheme();

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
      if (event.type === 'dismissed' || event.type === 'neutralButtonPressed') {
        return;
      }
    }

    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const handleClear = () => {
    onChange(null);
  };

  const formattedDate = value
    ? format(value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : placeholder;

  return (
    <View className={containerClassName}>
      {label && (
        <Text className="mb-2 text-sm font-semibold text-foreground dark:text-dark-foreground">
          {label}
        </Text>
      )}

      <View className="flex-row gap-2">
        <Pressable
          onPress={() => setShow(true)}
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

      {/* Android: DateTimePicker nativo direto */}
      {Platform.OS === 'android' && show && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}

      {/* iOS: Modal com DateTimePicker spinner */}
      {Platform.OS === 'ios' && show && (
        <Modal transparent animationType="slide" visible={show}>
          <Pressable
            className="flex-1 justify-end bg-black/50"
            onPress={() => setShow(false)}
          >
            <Pressable className="bg-white dark:bg-dark-card rounded-t-3xl">
              <View className="flex-row items-center px-4 py-3 border-b border-border dark:border-dark-border">
                <Pressable onPress={() => setShow(false)} className="flex-1">
                  <Text className="text-base font-medium text-primary">Cancelar</Text>
                </Pressable>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground dark:text-dark-foreground text-center">
                    {label || 'Selecionar Data'}
                  </Text>
                </View>
                <Pressable
                  onPress={() => {
                    setShow(false);
                  }}
                  className="flex-1"
                >
                  <Text className="text-base font-semibold text-primary text-right">OK</Text>
                </Pressable>
              </View>
              <View className="items-center py-4">
                <DateTimePicker
                  value={value || new Date()}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  locale="pt-BR"
                  textColor={colorScheme === 'dark' ? '#FFFFFF' : '#000000'}
                  minimumDate={minimumDate}
                  maximumDate={maximumDate}
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
