import type { Medication } from '@/src/@types';
import { deleteUserMedication, logMedicationTaken } from '@/src/api/services/user-medications';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { ConfirmMedicationModal } from './ConfirmMedicationModal';
import { MedicationCard } from './MedicationCard';
import { MedicationDetailsModal } from './MedicationDetailsModal';

interface DayViewProps {
  medications: Medication.UserMedication[];
  selectedDate: Date;
  onMedicationPress?: (medication: Medication.UserMedication, log?: Medication.MedicationLog) => void;
  onRefresh?: () => void;
}

interface MedicationSchedule {
  medication: Medication.UserMedication;
  scheduledTime: string;
  log?: Medication.MedicationLog;
}

export function DayView({ medications, selectedDate, onMedicationPress, onRefresh }: DayViewProps) {
  const router = useRouter();
  const [scheduledMeds, setScheduledMeds] = useState<MedicationSchedule[]>([]);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication.UserMedication | null>(null);
  const [selectedMedicationId, setSelectedMedicationId] = useState<number | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const formattedDate = format(selectedDate, "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  const scheduledMedications = useMemo<MedicationSchedule[]>(() => {
    const schedules: MedicationSchedule[] = [];
    const selectedDateString = format(selectedDate, 'yyyy-MM-dd');

    medications.forEach((medication) => {
      if (!medication.timeSlots || !Array.isArray(medication.timeSlots)) {
        return;
      }

      medication.timeSlots.forEach((timeSlot) => {
        const log = medication.logs?.find((l) => {
          const scheduledDate = format(parseISO(l.scheduledAt), 'yyyy-MM-dd');
          const scheduledTime = format(parseISO(l.scheduledAt), 'HH:mm');

          return scheduledDate === selectedDateString && scheduledTime === timeSlot;
        });

        schedules.push({
          medication,
          scheduledTime: timeSlot,
          log,
        });
      });
    });

    return schedules.sort((a, b) => {
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });
  }, [medications, selectedDate]);

  useEffect(() => {
    setScheduledMeds(scheduledMedications);
  }, [scheduledMedications]);

  const stats = useMemo(() => {
    const total = scheduledMeds.length;
    const taken = scheduledMeds.filter((s) => s.log?.status === 'taken').length;

    return { total, taken };
  }, [scheduledMeds]);

  const handleOpenConfirmModal = (medication: Medication.UserMedication, timeSlot: string) => {
    setSelectedMedication(medication);
    setSelectedTimeSlot(timeSlot);
    setConfirmModalVisible(true);
  };

  const handleCloseConfirmModal = () => {
    setConfirmModalVisible(false);
    setSelectedMedication(null);
    setSelectedTimeSlot('');
  };

  const handleOpenDetailsModal = (medicationId: number) => {
    setSelectedMedicationId(medicationId);
    setDetailsModalVisible(true);
  };

  const handleCloseDetailsModal = () => {
    setDetailsModalVisible(false);
    setSelectedMedicationId(null);
  };

  const handleMedicationAction = async (
    action: Medication.MedicationDetailsAction,
    medicationId: number,
  ) => {
    switch (action) {
      case 'mark-taken':
        const medication = medications.find((m) => m.id === medicationId);
        if (medication && medication.timeSlots.length > 0) {
          handleCloseDetailsModal();
          handleOpenConfirmModal(medication, medication.timeSlots[0]);
        }
        break;

      case 'edit':
        router.push(`/edit-medication/${medicationId}` as any);
        break;

      case 'delete':
        await handleDeleteMedication(medicationId);
        break;

      case 'view-history':
        router.push(`/medication-history/${medicationId}` as any);
        break;
    }
  };

  const handleDeleteMedication = async (medicationId: number) => {
    try {
      await deleteUserMedication(medicationId);
      Alert.alert('Sucesso', 'Medicamento excluído com sucesso!');
      onRefresh?.();
    } catch (error: any) {
      console.error('Erro ao excluir medicamento:', error);
      Alert.alert('Erro', error.message || 'Não foi possível excluir o medicamento');
    }
  };

  const handleConfirmMedicationTaken = async (payload: {
    timeSlot: string;
    takenAt?: string;
    notes?: string;
  }) => {
    if (!selectedMedication) return;

    setIsLoading(true);
    try {
      await logMedicationTaken(selectedMedication.id, {
        time_slot: payload.timeSlot,
        taken_at: payload.takenAt,
        notes: payload.notes,
      });

      setScheduledMeds((prev) =>
        prev.map((schedule) => {
          if (
            schedule.medication.id === selectedMedication.id &&
            schedule.scheduledTime === payload.timeSlot
          ) {
            return {
              ...schedule,
              log: {
                id: 0,
                userMedicationId: selectedMedication.id,
                scheduledAt: new Date().toISOString(),
                takenAt: payload.takenAt || new Date().toISOString(),
                status: 'taken',
                notes: payload.notes || null,
                createdAt: new Date().toISOString(),
              },
            };
          }
          return schedule;
        })
      );

      Alert.alert('Sucesso', 'Medicamento marcado como tomado!');
      handleCloseConfirmModal();
      onRefresh?.();
    } catch (error: any) {
      console.error('Erro ao marcar medicamento como tomado:', error);
      Alert.alert(
        'Erro',
        error.message || 'Não foi possível marcar o medicamento como tomado'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background dark:bg-dark-background">
      <View className="p-4">
        {scheduledMeds.length > 0 ? (
          <>
            {scheduledMeds.map((schedule, index) => (
              <MedicationCard
                key={`${schedule.medication.id}-${schedule.scheduledTime}-${index}`}
                medication={schedule.medication}
                scheduledTime={schedule.scheduledTime}
                log={schedule.log}
                onPress={() => handleOpenDetailsModal(schedule.medication.id)}
                onMarkAsTaken={() =>
                  handleOpenConfirmModal(schedule.medication, schedule.scheduledTime)
                }
              />
            ))}

            <View className="mt-2 mb-6">
              <Text className="text-center text-base text-foreground dark:text-dark-foreground">
                {stats.taken} de {stats.total} medicamentos tomados
              </Text>
            </View>
          </>
        ) : (
          <View className="py-12">
            <Text className="text-center text-base text-foreground dark:text-dark-foreground">
              Nenhum medicamento agendado para este dia
            </Text>
          </View>
        )}
      </View>

      <ConfirmMedicationModal
        visible={confirmModalVisible}
        medication={selectedMedication}
        scheduledTime={selectedTimeSlot}
        onConfirm={handleConfirmMedicationTaken}
        onCancel={handleCloseConfirmModal}
        isLoading={isLoading}
      />

      <MedicationDetailsModal
        visible={detailsModalVisible}
        medicationId={selectedMedicationId}
        onClose={handleCloseDetailsModal}
        onAction={handleMedicationAction}
        onMedicationDeleted={onRefresh}
      />
    </ScrollView>
  );
}
