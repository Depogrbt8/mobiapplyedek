import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { colors } from '@/constants/colors';

interface InputProps<T extends FieldValues = FieldValues> extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  // React Hook Form props
  control?: Control<T>;
  name?: Path<T>;
}

export const Input = <T extends FieldValues = FieldValues>({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  control,
  name,
  ...props
}: InputProps<T>) => {
  const [isFocused, setIsFocused] = useState(false);

  // If using react-hook-form
  if (control && name) {
    return (
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value }, fieldState: { error: fieldError } }) => (
          <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View
              style={[
                styles.inputContainer,
                isFocused && styles.inputContainerFocused,
                (error || fieldError) && styles.inputContainerError,
              ]}
            >
              {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
              <TextInput
                style={[styles.input, style]}
                placeholderTextColor={colors.text.disabled}
                value={value}
                onChangeText={onChange}
                onBlur={(e) => {
                  setIsFocused(false);
                  onBlur();
                  props.onBlur?.(e);
                }}
                onFocus={(e) => {
                  setIsFocused(true);
                  props.onFocus?.(e);
                }}
                {...props}
              />
              {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
            </View>
            {(error || fieldError?.message) && (
              <Text style={styles.errorText}>{error || fieldError?.message}</Text>
            )}
          </View>
        )}
      />
    );
  }

  // Regular input without react-hook-form
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.text.disabled}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    backgroundColor: colors.background,
    minHeight: 44, // Touch-friendly
  },
  inputContainerFocused: {
    borderColor: colors.primary[600],
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftIcon: {
    paddingLeft: 16,
  },
  rightIcon: {
    paddingRight: 16,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
});

