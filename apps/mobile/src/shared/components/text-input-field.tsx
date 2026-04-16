import { memo } from "react";
import type { TextInputProps } from "react-native";
import { FormField } from "@aramiworks/ui";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

type TextInputFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: TextInputProps["keyboardType"];
  error?: string;
  testID?: string;
};

function TextInputFieldInner<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  multiline,
  keyboardType,
  error,
  testID,
}: TextInputFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <FormField
          label={label}
          placeholder={placeholder}
          multiline={multiline}
          keyboardType={keyboardType}
          errorText={error}
          onChangeText={onChange}
          onBlur={onBlur}
          value={value as string}
          testID={testID}
        />
      )}
    />
  );
}

export const TextInputField = memo(
  TextInputFieldInner,
) as typeof TextInputFieldInner;
