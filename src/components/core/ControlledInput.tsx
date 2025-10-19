import React from 'react';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { Input, InputProps } from './Input';

interface ControlledInputProps<TFieldValues extends FieldValues>
  extends Omit<InputProps, 'name' | 'value' | 'onChangeText' | 'onBlur'> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
}

/**
 * Input component integrated with react-hook-form
 * @example
 * <ControlledInput
 *   control={control}
 *   name="email"
 *   label="E-mail"
 *   placeholder="seu@email.com"
 *   keyboardType="email-address"
 * />
 */
export function ControlledInput<TFieldValues extends FieldValues>({
  control,
  name,
  errors: apiErrors,
  ...inputProps
}: ControlledInputProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value, ref }, fieldState: { error } }) => {
        const stringValue = value === null || value === undefined ? '' : String(value);

        return (
          <Input
            ref={ref}
            name={String(name)}
            value={stringValue}
            onChangeText={onChange}
            onBlur={onBlur}
            error={error?.message}
            errors={apiErrors}
            {...inputProps}
          />
        );
      }}
    />
  );
}
