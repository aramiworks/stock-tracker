import { memo } from "react";
import { View, TextInput, StyleSheet, type TextInputProps } from "react-native";
import { Text } from "@aramiworks/ui";
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
    <View style={styles.container}>
      <Text role="body" size="small" fontWeight="600" marginBottom={6}>
        {label}
      </Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[
              styles.input,
              multiline && styles.multilineInput,
              error && styles.inputError,
            ]}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value as string}
            placeholder={placeholder}
            placeholderTextColor="#CCC"
            multiline={multiline}
            keyboardType={keyboardType}
            testID={testID}
          />
        )}
      />
      {error && (
        <Text role="body" size="small" color="$error" marginTop={4}>
          {error}
        </Text>
      )}
    </View>
  );
}

export const TextInputField = memo(
  TextInputFieldInner,
) as typeof TextInputFieldInner;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },

  input: {
    height: 44,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontFamily: "Inter",
    fontSize: 15,
    color: "#1A1A1A",
  },
  multilineInput: {
    height: 88,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: "#FF2D55",
  },
});
