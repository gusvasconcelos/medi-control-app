import type { Medication } from '@/src/@types';
import { TimePicker } from '@/src/components/core';
import { format } from 'date-fns';
import { X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

interface ConfirmMedicationModalProps {
  visible: boolean;
  medication: Medication.UserMedication | null;
  scheduledTime: string;
  onConfirm: (payload: {
    timeSlot: string;
    takenAt?: string;
    notes?: string;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmMedicationModal({
  visible,
  medication,
  scheduledTime,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmMedicationModalProps) {
  const [takenAtTime, setTakenAtTime] = useState<Date>(new Date());
  const [notes, setNotes] = useState('');

  const handleConfirm = async () => {
    try {
      await onConfirm({
        timeSlot: scheduledTime,
        takenAt: takenAtTime ? format(takenAtTime, "yyyy-MM-dd'T'HH:mm:ss") : undefined,
        notes: notes.trim() || undefined,
      });
      // Reset form
      setTakenAtTime(new Date());
      setNotes('');
    } catch (error) {
      console.error('Erro ao confirmar medicamento:', error);
    }
  };

  if (!medication) return null;

  const medicationName = medication.medication?.name || 'Medicamento sem nome';
  const dosage = medication.dosage || '';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-black/40">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
          scrollEnabled={false}
        >
          <View className="bg-white dark:bg-dark-card rounded-t-3xl p-6">
            {/* Header com Close */}
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-foreground dark:text-dark-foreground">
                  Confirmar Medicamento Tomado
                </Text>
                <Text className="text-sm text-muted dark:text-dark-muted mt-1">
                  Registre os detalhes sobre {medicationName}
                </Text>
              </View>
              <Pressable onPress={onCancel} className="p-2">
                <X size={24} color="#6B7280" />
              </Pressable>
            </View>

            {/* Medicamento Info */}
            <View className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
              <Text className="text-sm font-semibold text-foreground dark:text-dark-foreground mb-1">
                {medicationName}
              </Text>
              {dosage && (
                <Text className="text-xs text-muted dark:text-dark-muted">
                  {dosage}
                </Text>
              )}
            </View>

            {/* Horário que deveria ter tomado */}
            <View className="mb-4">
              <Text className="text-base font-semibold text-foreground dark:text-dark-foreground mb-2">
                Horário que deveria ter tomado <Text className="text-destructive">*</Text>
              </Text>
              <View className="flex-row items-center px-4 py-3.5 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl">
                <Text className="text-base text-foreground dark:text-dark-foreground font-medium">
                  {scheduledTime}
                </Text>
              </View>
            </View>

            {/* Horário que tomou */}
            <View className="mb-4">
              <Text className="text-base font-semibold text-foreground dark:text-dark-foreground mb-2">
                Horário que tomou
              </Text>
              <TimePicker
                value={takenAtTime}
                onChange={setTakenAtTime}
                containerClassName=""
              />
              <Text className="text-xs text-muted dark:text-dark-muted mt-2">
                Deixe em branco para usar o horário atual
              </Text>
            </View>

            {/* Notas adicionais */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-foreground dark:text-dark-foreground mb-2">
                Notas adicionais
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Ex: Tomei após o café da manhã"
                placeholderTextColor="#9CA3AF"
                multiline
                maxLength={1000}
                numberOfLines={4}
                className="
                  px-4 py-3 bg-white dark:bg-dark-card border border-border dark:border-dark-border
                  rounded-xl text-base text-foreground dark:text-dark-foreground
                "
                editable={!isLoading}
              />
              <Text className="text-xs text-muted dark:text-dark-muted mt-1">
                {notes.length}/1000
              </Text>
            </View>

            {/* Buttons */}
            <View className="gap-3">
              <Pressable
                onPress={handleConfirm}
                disabled={isLoading}
                className="bg-primary py-4 rounded-xl active:opacity-80 disabled:opacity-50 flex-row items-center justify-center"
              >
                {isLoading ? (
                  <ActivityIndicator size={20} color="#FFFFFF" />
                ) : (
                  <Text className="text-white font-bold text-base">Confirmar</Text>
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
