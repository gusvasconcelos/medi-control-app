import type { Medication } from '@/src/@types';
import { AlertCircle, Check, Clock, SquareCheckBig, X } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface MedicationCardProps {
  medication: Medication.UserMedication;
  scheduledTime: string;
  log?: Medication.MedicationLog;
  onPress?: () => void;
  onMarkAsTaken?: () => void;
}

const STATUS_CONFIG = {
  pending: {
    label: 'Pendente',
    color: 'text-yellow-600 dark:text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    borderColor: 'border-yellow-400 dark:border-yellow-600',
  },
  taken: {
    label: 'Tomado',
    color: 'text-health dark:text-health',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    borderColor: 'border-health dark:border-health',
  },
  missed: {
    label: 'Perdido',
    color: 'text-destructive dark:text-destructive',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-destructive dark:border-destructive',
  },
  skipped: {
    label: 'Ignorado',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-950/30',
    borderColor: 'border-gray-400 dark:border-gray-600',
  },
} as const;

const MEDICATION_COLORS = [
  'bg-primary',
  'bg-health',
  'bg-purple-500',
  'bg-pink-500',
  'bg-orange-500',
  'bg-teal-500',
] as const;

export function MedicationCard({
  medication,
  scheduledTime,
  log,
  onPress,
  onMarkAsTaken,
}: MedicationCardProps) {
  const status = log?.status || 'pending';
  const statusConfig = STATUS_CONFIG[status];

  // Gera uma cor baseada no ID do medicamento para consistência
  const colorIndex = medication.id % MEDICATION_COLORS.length;
  const medicationColor = MEDICATION_COLORS[colorIndex];

  // Retorna o ícone correto de acordo com o status
  const getStatusIcon = () => {
    const iconSize = 14;
    const iconColor =
      status === 'pending'
        ? '#CA8A04'
        : status === 'taken'
        ? '#13C57B'
        : status === 'missed'
        ? '#ED3939'
        : '#6B7280';

    switch (status) {
      case 'taken':
        return <Check size={iconSize} color={iconColor} />;
      case 'missed':
        return <X size={iconSize} color={iconColor} />;
      case 'skipped':
        return <AlertCircle size={iconSize} color={iconColor} />;
      case 'pending':
      default:
        return <Clock size={iconSize} color={iconColor} />;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      className="mb-4 rounded-2xl border border-border dark:border-dark-border bg-white dark:bg-dark-card p-4 active:opacity-80"
    >
      <View className="flex-row items-center justify-between">
        {/* Lado esquerdo: indicador de cor e informações */}
        <View className="flex-1 flex-row items-center gap-3">
          {/* Indicador de cor do medicamento */}
          <View className={`w-3 h-3 rounded-full ${medicationColor}`} />

          {/* Informações do medicamento */}
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground dark:text-dark-foreground">
              {medication.medication?.name || 'Medicamento sem nome'}
            </Text>
            <Text className="text-sm text-foreground dark:text-dark-foreground mt-0.5">
              {scheduledTime}
            </Text>
          </View>
        </View>

        {/* Lado direito: botão de ação + badge de status */}
        <View className="flex-row items-center gap-2">
          {/* Botão de ação (só aparece quando pendente) */}
          {status === 'pending' && onMarkAsTaken && (
            <Pressable
              onPress={onMarkAsTaken}
              className="p-2 active:opacity-70"
            >
              <SquareCheckBig size={20} color="#13C57B" />
            </Pressable>
          )}

          {/* Badge de status (sempre visível) */}
          <View
            className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border ${statusConfig.borderColor} ${statusConfig.bgColor}`}
          >
            {getStatusIcon()}
            <Text className={`text-xs font-medium ${statusConfig.color}`}>
              {statusConfig.label}
            </Text>
          </View>
        </View>
      </View>

      {/* Dosagem (se disponível) */}
      {medication.dosage && (
        <View className="mt-2 ml-6">
          <Text className="text-sm text-foreground dark:text-dark-foreground">
            {medication.dosage}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
