import React, { useState } from 'react';
import { Pressable, Text, View, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Clock } from 'lucide-react-native';
import { format } from 'date-fns';

interface TimePickerProps {
  label?: string;
  value: Date;
  onChange: (time: Date) => void;
  containerClassName?: string;
}

export function TimePicker({ label, value, onChange, containerClassName = '' }: TimePickerProps) {
  const [show, setShow] = useState(false);

  const handleChange = (_event: any, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios'); // iOS mantém aberto, Android fecha
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const formattedTime = format(value, 'HH:mm');

  return (
    <View className={containerClassName}>
      {label && (
        <Text className="mb-2 text-sm font-semibold text-foreground dark:text-dark-foreground">
          {label}
        </Text>
      )}

      <Pressable
        onPress={() => setShow(true)}
        className="flex-row items-center justify-between px-4 py-3.5 bg-white dark:bg-dark-card border border-border dark:border-dark-border rounded-xl"
        style={{ minHeight: 52 }}
      >
        <Text className="text-base text-foreground dark:text-dark-foreground">
          {formattedTime}
        </Text>
        <Clock size={20} color="#6B7280" />
      </Pressable>

      {show && (
        <DateTimePicker
          value={value}
          mode="time"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
        />
      )}
    </View>
  );
}
