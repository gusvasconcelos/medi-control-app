import type { Medication } from '@/src/@types';
import { getUserMedication } from '@/src/api/services/user-medications';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertCircle,
  Calendar,
  Check,
  Clock,
  Edit2,
  History,
  Pill,
  Trash2,
  X,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

interface MedicationDetailsModalProps {
  visible: boolean;
  medicationId: number | null;
  onClose: () => void;
  onAction: (
    action: Medication.MedicationDetailsAction,
    medicationId: number,
  ) => void;
  onMedicationDeleted?: () => void;
}

export function MedicationDetailsModal({
  visible,
  medicationId,
  onClose,
  onAction,
  onMedicationDeleted,
}: MedicationDetailsModalProps) {
  const [medication, setMedication] = useState<Medication.UserMedication | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMedicationDetails = useCallback(async () => {
    if (!medicationId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getUserMedication(medicationId);
      setMedication(response.data);
    } catch (err) {
      console.error('Erro ao buscar detalhes do medicamento:', err);
      setError('Erro ao carregar detalhes do medicamento');
    } finally {
      setIsLoading(false);
    }
  }, [medicationId]);

  useEffect(() => {
    if (visible && medicationId) {
      fetchMedicationDetails();
    }
  }, [visible, medicationId, fetchMedicationDetails]);

  const handleAction = (action: Medication.MedicationDetailsAction) => {
    if (!medicationId) return;

    if (action === 'delete') {
      Alert.alert(
        'Excluir Medicamento',
        'Tem certeza que deseja excluir este medicamento? Esta ação não pode ser desfeita.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: () => {
              onAction(action, medicationId);
              onClose();
            },
          },
        ],
      );
    } else {
      onAction(action, medicationId);
      if (action !== 'mark-taken') {
        onClose();
      }
    }
  };

  const getStatusColor = (status: Medication.MedicationLogStatus) => {
    switch (status) {
      case 'taken':
        return 'text-green-600 dark:text-green-400';
      case 'missed':
        return 'text-red-600 dark:text-red-400';
      case 'skipped':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-yellow-600 dark:text-yellow-400';
    }
  };

  const getStatusIcon = (status: Medication.MedicationLogStatus) => {
    const color = status === 'taken' ? '#16a34a' : status === 'missed' ? '#dc2626' : '#9ca3af';

    switch (status) {
      case 'taken':
        return <Check size={16} color={color} />;
      case 'missed':
        return <X size={16} color={color} />;
      case 'skipped':
        return <AlertCircle size={16} color={color} />;
      default:
        return <Clock size={16} color="#ca8a04" />;
    }
  };

  const getStatusLabel = (status: Medication.MedicationLogStatus) => {
    switch (status) {
      case 'taken':
        return 'Tomado';
      case 'missed':
        return 'Perdido';
      case 'skipped':
        return 'Pulado';
      default:
        return 'Pendente';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-foreground dark:text-dark-foreground mt-4">
            Carregando detalhes...
          </Text>
        </View>
      );
    }

    if (error || !medication) {
      return (
        <View className="flex-1 items-center justify-center py-20">
          <AlertCircle size={48} color="#EF4444" />
          <Text className="text-foreground dark:text-dark-foreground mt-4 text-center px-6">
            {error || 'Não foi possível carregar os detalhes'}
          </Text>
          <Pressable
            onPress={fetchMedicationDetails}
            className="mt-4 px-6 py-3 bg-primary rounded-xl"
          >
            <Text className="text-white font-semibold">Tentar novamente</Text>
          </Pressable>
        </View>
      );
    }

    const medicationName = medication.medication?.name || 'Medicamento sem nome';
    const sortedLogs = [...medication.logs].sort(
      (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
    );
    const recentLogs = sortedLogs.slice(0, 5);

    return (
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Medication Name & Dosage */}
        <View className="mb-6">
          <View className="flex-row items-center mb-2">
            <Pill size={24} color="#3B82F6" />
            <Text className="text-2xl font-bold text-foreground dark:text-dark-foreground ml-2">
              {medicationName}
            </Text>
          </View>
          {medication.dosage && (
            <Text className="text-base text-foreground dark:text-dark-foreground">
              {medication.dosage}
            </Text>
          )}
        </View>

        {/* Schedule Times */}
        <View className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
          <View className="flex-row items-center mb-3">
            <Clock size={20} color="#3B82F6" />
            <Text className="text-base font-semibold text-foreground dark:text-dark-foreground ml-2">
              Horários Agendados
            </Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {medication.timeSlots.map((time, index) => (
              <View
                key={index}
                className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg"
              >
                <Text className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {time}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Duration & Dates */}
        <View className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800">
          <View className="flex-row items-center mb-3">
            <Calendar size={20} color="#6B7280" />
            <Text className="text-base font-semibold text-foreground dark:text-dark-foreground ml-2">
              Período do Tratamento
            </Text>
          </View>
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-sm text-foreground dark:text-dark-foreground">
                Início:
              </Text>
              <Text className="text-sm font-medium text-foreground dark:text-dark-foreground">
                {formatDate(medication.startDate)}
              </Text>
            </View>
            {medication.endDate && (
              <View className="flex-row justify-between">
                <Text className="text-sm text-foreground dark:text-dark-foreground">
                  Término:
                </Text>
                <Text className="text-sm font-medium text-foreground dark:text-dark-foreground">
                  {formatDate(medication.endDate)}
                </Text>
              </View>
            )}
            {medication.duration && (
              <View className="flex-row justify-between">
                <Text className="text-sm text-foreground dark:text-dark-foreground">
                  Duração:
                </Text>
                <Text className="text-sm font-medium text-foreground dark:text-dark-foreground">
                  {medication.duration} dias
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Via Administration & Stock */}
        <View className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
          <Text className="text-base font-semibold text-foreground dark:text-dark-foreground mb-3">
            Informações Adicionais
          </Text>
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-sm text-foreground dark:text-dark-foreground">
                Via de Administração:
              </Text>
              <Text className="text-sm font-medium text-foreground dark:text-dark-foreground capitalize">
                {medication.viaAdministration}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-foreground dark:text-dark-foreground">
                Estoque Atual:
              </Text>
              <Text
                className={`text-sm font-medium ${medication.currentStock <= medication.lowStockThreshold ? 'text-red-600 dark:text-red-400' : 'text-foreground dark:text-dark-foreground'}`}
              >
                {medication.currentStock} unidades
              </Text>
            </View>
            {medication.currentStock <= medication.lowStockThreshold && (
              <View className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Text className="text-xs text-red-700 dark:text-red-300 text-center">
                  ⚠️ Estoque baixo! Considere repor.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Notes */}
        {medication.notes && (
          <View className="mb-6 p-4 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800">
            <Text className="text-base font-semibold text-foreground dark:text-dark-foreground mb-2">
              Instruções de Uso
            </Text>
            <Text className="text-sm text-foreground dark:text-dark-foreground leading-5">
              {medication.notes}
            </Text>
          </View>
        )}

        {/* Recent History */}
        {recentLogs.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <History size={20} color="#6B7280" />
                <Text className="text-base font-semibold text-foreground dark:text-dark-foreground ml-2">
                  Histórico Recente
                </Text>
              </View>
              <Pressable onPress={() => handleAction('view-history')}>
                <Text className="text-sm text-primary font-medium">Ver tudo</Text>
              </Pressable>
            </View>
            <View className="gap-2">
              {recentLogs.map((log) => (
                <View
                  key={log.id}
                  className="flex-row items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800"
                >
                  <View className="flex-row items-center flex-1">
                    {getStatusIcon(log.status)}
                    <View className="ml-3 flex-1">
                      <Text
                        className={`text-sm font-medium ${getStatusColor(log.status)}`}
                      >
                        {getStatusLabel(log.status)}
                      </Text>
                      <Text className="text-xs text-foreground dark:text-dark-foreground mt-0.5">
                        {formatDateTime(log.scheduledAt)}
                      </Text>
                    </View>
                  </View>
                  {log.takenAt && (
                    <Text className="text-xs text-foreground dark:text-dark-foreground">
                      Tomado: {format(parseISO(log.takenAt), 'HH:mm')}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View className="gap-3 mb-6">
          <Pressable
            onPress={() => handleAction('mark-taken')}
            className="flex-row items-center justify-center bg-green-600 py-4 rounded-xl active:opacity-80"
          >
            <Check size={20} color="#FFFFFF" />
            <Text className="text-white font-bold text-base ml-2">Marcar como Tomado</Text>
          </Pressable>

          <View className="flex-row gap-3">
            <Pressable
              onPress={() => handleAction('edit')}
              className="flex-1 flex-row items-center justify-center bg-blue-600 py-4 rounded-xl active:opacity-80"
            >
              <Edit2 size={18} color="#FFFFFF" />
              <Text className="text-white font-semibold text-sm ml-2">Editar</Text>
            </Pressable>

            <Pressable
              onPress={() => handleAction('delete')}
              className="flex-1 flex-row items-center justify-center bg-red-600 py-4 rounded-xl active:opacity-80"
            >
              <Trash2 size={18} color="#FFFFFF" />
              <Text className="text-white font-semibold text-sm ml-2">Excluir</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/40">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
          scrollEnabled={false}
        >
          <View className="bg-white dark:bg-dark-card rounded-t-3xl p-6 max-h-[90%]">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-foreground dark:text-dark-foreground">
                Detalhes do Medicamento
              </Text>
              <Pressable onPress={onClose} className="p-2">
                <X size={24} color="#6B7280" />
              </Pressable>
            </View>

            {renderContent()}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
