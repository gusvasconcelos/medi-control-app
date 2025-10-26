import type { Medication } from '@/src/@types';
import { createUserMedicationWithExisting, createUserMedicationWithNew } from '@/src/api/services';
import { searchMedications } from '@/src/api/services/medications';
import { DatePicker, Input, TimePicker } from '@/src/components';
import { useAuth } from '@/src/hooks/useAuth';
import { useDebounce } from '@/src/hooks/useDebounce';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { Plus, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

const MEDICATION_FORMS: { value: Medication.MedicationForm; label: string }[] = [
  { value: 'tablet', label: 'Comprimido' },
  { value: 'capsule', label: 'Cápsula' },
  { value: 'liquid', label: 'Líquido' },
  { value: 'injection', label: 'Injeção' },
  { value: 'cream', label: 'Pomada' },
  { value: 'drops', label: 'Gotas' },
  { value: 'spray', label: 'Spray' },
  { value: 'inhaler', label: 'Inalador' },
  { value: 'patch', label: 'Adesivo' },
  { value: 'other', label: 'Outro' },
];

const VIA_ADMINISTRATION: { value: Medication.ViaAdministration; label: string }[] = [
  { value: 'oral', label: 'Oral' },
  { value: 'topical', label: 'Tópico' },
  { value: 'injection', label: 'Injeção' },
  { value: 'inhalation', label: 'Inalação' },
  { value: 'sublingual', label: 'Sublingual' },
  { value: 'rectal', label: 'Retal' },
  { value: 'other', label: 'Outro' },
];

export default function AddMedicationScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  const [selectedMedicationId, setSelectedMedicationId] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<Medication.Medication[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [medicationName, setMedicationName] = useState('');
  const [activePrinciple, setActivePrinciple] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [strength, setStrength] = useState('');
  const [form, setForm] = useState<Medication.MedicationForm>('tablet');
  const [category, setCategory] = useState('');

  const debouncedMedicationName = useDebounce(medicationName, 500);

  const [dosage, setDosage] = useState('');
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [viaAdministration, setViaAdministration] = useState<Medication.ViaAdministration>('oral');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [initialStock, setInitialStock] = useState('30');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [notes, setNotes] = useState('');

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchMedications = async () => {
      if (!user) {
        setSearchResults([]);
        setShowSuggestions(false);
        return;
      }

      if (debouncedMedicationName.trim().length >= 3) {
        try {
          setIsSearching(true);
          const results = await searchMedications({
            search: debouncedMedicationName,
            limit: 5,
          });
          setSearchResults(results.data);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Erro ao buscar medicamentos:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowSuggestions(false);
      }
    };

    fetchMedications();
  }, [debouncedMedicationName, user?.id]);

  const handleSelectMedication = (medication: Medication.Medication) => {
    setSelectedMedicationId(medication.id);
    setMedicationName(medication.name);
    setActivePrinciple(medication.activePrinciple || '');
    setManufacturer(medication.manufacturer || '');
    setStrength(medication.strength || '');
    setCategory(medication.category || '');
    if (medication.form) {
      setForm(medication.form);
    }

    setShowSuggestions(false);
    setSearchResults([]);
  };

  const handleMedicationNameChange = (text: string) => {
    setMedicationName(text);
    if (selectedMedicationId) {
      setSelectedMedicationId(null);
    }
  };

  const handleAddTimeSlot = () => {
    const timeString = format(currentTime, 'HH:mm');
    if (!timeSlots.includes(timeString)) {
      setTimeSlots([...timeSlots, timeString].sort());
    }
  };

  const handleRemoveTimeSlot = (time: string) => {
    setTimeSlots(timeSlots.filter((t) => t !== time));
  };

  const handleSubmit = async () => {
    if (!medicationName.trim()) {
      Alert.alert('Erro', 'Digite o nome do medicamento');
      return;
    }

    if (!selectedMedicationId && !activePrinciple.trim()) {
      Alert.alert('Erro', 'Digite o princípio ativo');
      return;
    }

    if (!dosage.trim()) {
      Alert.alert('Erro', 'Digite a posologia');
      return;
    }

    if (timeSlots.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos um horário');
      return;
    }

    try {
      setIsLoading(true);

      if (selectedMedicationId) {
        const payload: Medication.StoreUserMedicationWithExisting = {
          medication_id: selectedMedicationId,
          dosage,
          time_slots: timeSlots,
          via_administration: viaAdministration,
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null,
          initial_stock: parseInt(initialStock) || 0,
          current_stock: parseInt(initialStock) || 0,
          low_stock_threshold: parseInt(lowStockThreshold) || 5,
          notes: notes || null,
        };

        await createUserMedicationWithExisting(payload);
      } else {
        const payload: Medication.StoreUserMedicationWithNew = {
          medication_name: medicationName,
          medication_active_principle: activePrinciple,
          medication_manufacturer: manufacturer || null,
          medication_strength: strength || null,
          medication_form: form,
          dosage,
          time_slots: timeSlots,
          via_administration: viaAdministration,
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null,
          initial_stock: parseInt(initialStock) || 0,
          current_stock: parseInt(initialStock) || 0,
          low_stock_threshold: parseInt(lowStockThreshold) || 5,
          notes: notes || null,
        };

        await createUserMedicationWithNew(payload);
      }

      router.replace('/calendar');
    } catch (error: any) {
      console.error('Erro ao cadastrar medicamento:', error);
      Alert.alert(
        'Erro',
        error?.response?.data?.message || 'Erro ao cadastrar medicamento. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView
        className="flex-1 bg-background dark:bg-dark-background"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="p-4 pt-6">
          {/* Informações do Medicamento */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground dark:text-dark-foreground mb-4">
              Informações do Medicamento
            </Text>

            {/* Campo de busca com autocomplete */}
            <View className="mb-4">
              <View className="relative">
                <Input
                  name="medicationName"
                  label="Nome do Medicamento *"
                  placeholder="Ex: Paracetamol 500mg"
                  value={medicationName}
                  onChangeText={handleMedicationNameChange}
                  containerClassName="mb-0"
                />

                {/* Indicador de carregamento */}
                {isSearching && (
                  <View className="absolute right-3 top-11">
                    <ActivityIndicator size="small" color="#0D7FFF" />
                  </View>
                )}
              </View>

              {/* Badge indicando medicamento selecionado */}
              {selectedMedicationId && (
                <View className="mt-2 flex-row items-center gap-2 px-3 py-2 bg-health/10 dark:bg-health/20 rounded-lg border border-health">
                  <Text className="text-xs font-medium text-health">
                    ✓ Medicamento existente selecionado
                  </Text>
                </View>
              )}

              {/* Lista de sugestões */}
              {showSuggestions && searchResults.length > 0 && (
                <View className="mt-2 border border-border dark:border-dark-border rounded-xl bg-white dark:bg-dark-card overflow-hidden">
                  <ScrollView className="max-h-60">
                    {searchResults.map((medication, index) => {
                      const parts = [medication.name];
                      if (medication.activePrinciple) {
                        parts.push(medication.activePrinciple);
                      }
                      if (medication.category) {
                        parts.push(medication.category);
                      }
                      if (medication.form) {
                        const formLabel = MEDICATION_FORMS.find(f => f.value === medication.form)?.label;
                        if (formLabel) {
                          parts.push(formLabel);
                        }
                      }
                      const label = parts.join(' • ');

                      return (
                        <Pressable
                          key={medication.id}
                          onPress={() => handleSelectMedication(medication)}
                          className={`p-3 active:bg-primary/10 dark:active:bg-primary/20 ${
                            index > 0 ? 'border-t border-border dark:border-dark-border' : ''
                          }`}
                        >
                          <Text className="text-sm font-medium text-foreground dark:text-dark-foreground mb-1">
                            {medication.name}
                          </Text>
                          <Text className="text-xs text-foreground dark:text-dark-foreground">
                            {label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {/* Mensagem quando não há resultados */}
              {showSuggestions && searchResults.length === 0 && !isSearching && debouncedMedicationName.length >= 3 && (
                <View className="mt-2 p-3 bg-muted dark:bg-dark-muted rounded-xl">
                  <Text className="text-sm text-muted dark:text-dark-muted text-center">
                    Nenhum medicamento encontrado. Preencha os dados para cadastrar um novo.
                  </Text>
                </View>
              )}
            </View>

            <Input
              name="activePrinciple"
              label="Princípio Ativo *"
              placeholder="Ex: Paracetamol"
              value={activePrinciple}
              onChangeText={setActivePrinciple}
              containerClassName="mb-4"
              editable={!selectedMedicationId}
            />

            <Input
              name="manufacturer"
              label="Fabricante"
              placeholder="Ex: EMS"
              value={manufacturer}
              onChangeText={setManufacturer}
              containerClassName="mb-4"
              editable={!selectedMedicationId}
            />

            <Input
              name="strength"
              label="Dosagem"
              placeholder="Ex: 500mg"
              value={strength}
              onChangeText={setStrength}
              containerClassName="mb-4"
              editable={!selectedMedicationId}
            />

            {/* Forma farmacêutica */}
            <Text className="text-sm font-medium text-foreground dark:text-dark-foreground mb-2">
              Forma Farmacêutica
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row gap-2">
                {MEDICATION_FORMS.map((item) => (
                  <Pressable
                    key={item.value}
                    onPress={() => !selectedMedicationId && setForm(item.value)}
                    disabled={!!selectedMedicationId}
                    className={`px-4 py-2 rounded-full border ${
                      form === item.value
                        ? 'border-primary bg-primary/10 dark:bg-primary/20'
                        : 'border-border dark:border-dark-border bg-white dark:bg-dark-card'
                    } ${selectedMedicationId ? 'opacity-60' : ''}`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        form === item.value
                          ? 'text-primary'
                          : 'text-foreground dark:text-dark-foreground'
                      }`}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Informações do Tratamento */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-foreground dark:text-dark-foreground mb-4">
              Informações do Tratamento
            </Text>

            <Input
              name="dosage"
              label="Posologia *"
              placeholder="Ex: 1 comprimido"
              value={dosage}
              onChangeText={setDosage}
              containerClassName="mb-4"
            />

            {/* Via de administração */}
            <Text className="text-sm font-medium text-foreground dark:text-dark-foreground mb-2">
              Via de Administração *
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <View className="flex-row gap-2">
                {VIA_ADMINISTRATION.map((item) => (
                  <Pressable
                    key={item.value}
                    onPress={() => setViaAdministration(item.value)}
                    className={`px-4 py-2 rounded-full border ${
                      viaAdministration === item.value
                        ? 'border-primary bg-primary/10 dark:bg-primary/20'
                        : 'border-border dark:border-dark-border bg-white dark:bg-dark-card'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        viaAdministration === item.value
                          ? 'text-primary'
                          : 'text-foreground dark:text-dark-foreground'
                      }`}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            {/* Horários */}
            <Text className="text-sm font-medium text-foreground dark:text-dark-foreground mb-2">
              Horários *
            </Text>
            <View className="flex-row gap-2 mb-2">
              <View className="flex-1">
                <TimePicker value={currentTime} onChange={setCurrentTime} />
              </View>
              <Pressable
                onPress={handleAddTimeSlot}
                className="w-12 h-12 bg-primary rounded-xl items-center justify-center"
                style={{ minHeight: 52 }}
              >
                <Plus size={20} color="white" />
              </Pressable>
            </View>

            {timeSlots.length > 0 && (
              <View className="flex-row flex-wrap gap-2 mb-4">
                {timeSlots.map((time) => (
                  <View
                    key={time}
                    className="flex-row items-center gap-2 px-3 py-2 bg-primary/10 dark:bg-primary/20 rounded-full border border-primary"
                  >
                    <Text className="text-sm font-medium text-primary">{time}</Text>
                    <Pressable onPress={() => handleRemoveTimeSlot(time)}>
                      <X size={16} color="#0D7FFF" />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            <DatePicker
              label="Data de Início *"
              value={startDate}
              onChange={(date) => date && setStartDate(date)}
              containerClassName="mb-4"
            />

            <DatePicker
              label="Data de Término"
              value={endDate}
              onChange={setEndDate}
              placeholder="Opcional - Selecione se houver"
              allowClear
              containerClassName="mb-4"
              minimumDate={startDate}
            />

            <Input
              name="initialStock"
              label="Estoque Inicial *"
              placeholder="Ex: 30"
              value={initialStock}
              onChangeText={setInitialStock}
              keyboardType="number-pad"
              containerClassName="mb-4"
            />

            <Input
              name="lowStockThreshold"
              label="Limite de Estoque Baixo *"
              placeholder="Ex: 5"
              value={lowStockThreshold}
              onChangeText={setLowStockThreshold}
              keyboardType="number-pad"
              containerClassName="mb-4"
            />

            <Input
              name="notes"
              label="Observações"
              placeholder="Notas adicionais (opcional)"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              containerClassName="mb-4"
            />
          </View>

          {/* Botão de Salvar */}
          <Pressable
            onPress={handleSubmit}
            disabled={isLoading}
            className={`bg-primary rounded-xl py-4 items-center justify-center ${
              isLoading ? 'opacity-50' : ''
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-base font-semibold">Cadastrar Medicamento</Text>
            )}
        </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
