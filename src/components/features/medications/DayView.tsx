import type { Medication } from '@/src/@types';
import { logMedicationTaken } from '@/src/api/services/user-medications';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { ConfirmMedicationModal } from './ConfirmMedicationModal';
import { MedicationCard } from './MedicationCard';

interface DayViewProps {
  medications: Medication.UserMedication[];
  selectedDate: Date;
  onMedicationPress?: (medication: Medication.UserMedication, log?: Medication.MedicationLog) => void;
}

interface MedicationSchedule {
  medication: Medication.UserMedication;
  scheduledTime: string;
  log?: Medication.MedicationLog;
}

export function DayView({ medications, selectedDate, onMedicationPress }: DayViewProps) {
  const [scheduledMeds, setScheduledMeds] = useState<MedicationSchedule[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication.UserMedication | null>(null);
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

  const handleOpenModal = (medication: Medication.UserMedication, timeSlot: string) => {
    setSelectedMedication(medication);
    setSelectedTimeSlot(timeSlot);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedMedication(null);
    setSelectedTimeSlot('');
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
      handleCloseModal();
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
        <Text className="text-xl font-semibold text-foreground dark:text-dark-foreground mb-6 text-center capitalize">
          {formattedDate}
        </Text>

        {scheduledMeds.length > 0 ? (
          <>
            {scheduledMeds.map((schedule, index) => (
              <MedicationCard
                key={`${schedule.medication.id}-${schedule.scheduledTime}-${index}`}
                medication={schedule.medication}
                scheduledTime={schedule.scheduledTime}
                log={schedule.log}
                onPress={() => onMedicationPress?.(schedule.medication, schedule.log)}
                onMarkAsTaken={() =>
                  handleOpenModal(schedule.medication, schedule.scheduledTime)
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
        visible={modalVisible}
        medication={selectedMedication}
        scheduledTime={selectedTimeSlot}
        onConfirm={handleConfirmMedicationTaken}
        onCancel={handleCloseModal}
        isLoading={isLoading}
      />
    </ScrollView>
  );
}
