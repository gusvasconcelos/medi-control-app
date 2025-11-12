import React from 'react';
import { Platform, Text, TextInput, TextInputProps, View } from 'react-native';

export interface InputProps extends TextInputProps {
  name: string;
  label?: string;
  errors?: Record<string, string[]>;
  error?: string;
  containerClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      name,
      label,
      errors,
      error,
      containerClassName = '',
      inputClassName = '',
      labelClassName = '',
      ...textInputProps
    },
    ref
  ) => {
    const apiErrors = React.useMemo(() => errors?.[name], [errors, name]);

    const allErrors = React.useMemo(() => [
      ...(apiErrors || []),
      ...(error ? [error] : [])
    ], [apiErrors, error]);

    const hasError = allErrors.length > 0;

    const inputStyle = React.useMemo(() => {
      const baseStyle = {
        paddingHorizontal: 16,
      };

      if (textInputProps.multiline) {
        return {
          ...baseStyle,
          minHeight: 52,
          paddingTop: 14,
          paddingBottom: 14,
          textAlignVertical: 'top' as const,
        };
      }

      // Para inputs de linha única - abordagem unificada para iOS e Android
      return {
        ...baseStyle,
        height: 52,
        paddingTop: 0,
        paddingBottom: 0,
        textAlignVertical: 'center' as const,
        lineHeight: 20,
      };
    }, [textInputProps.multiline]);

    return (
      <View className={`mb-4 ${containerClassName}`}>
        {label && (
          <Text className={`mb-2 text-sm font-semibold text-foreground dark:text-dark-foreground ${labelClassName}`}>
            {label}
          </Text>
        )}

        <TextInput
          ref={ref}
          className={`
            bg-white dark:bg-dark-card border rounded-xl text-base text-foreground dark:text-dark-foreground
            ${hasError ? 'border-destructive' : 'border-border dark:border-dark-border'}
            ${inputClassName}
          `.trim()}
          style={inputStyle}
          placeholderTextColor="hsl(215, 20%, 65%)"
          includeFontPadding={false}
          {...textInputProps}
        />

        {hasError && (
          <View className="mt-1">
            {allErrors.map((errorMessage, index) => (
              <Text key={index} className="text-xs text-destructive">
                {errorMessage}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';
