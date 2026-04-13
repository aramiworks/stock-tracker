import { memo, type ReactNode } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

type FormModalProps = {
  visible: boolean;
  title: string;
  submitLabel?: string;
  onSubmit: () => void;
  onClose: () => void;
  children: ReactNode;
  testIDPrefix?: string;
};

export const FormModal = memo(
  ({
    visible,
    title,
    submitLabel = "저장",
    onSubmit,
    onClose,
    children,
    testIDPrefix,
  }: FormModalProps) => {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.header}>
            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              testID={testIDPrefix ? `${testIDPrefix}-cancel` : undefined}
            >
              <Text style={styles.closeText}>취소</Text>
            </Pressable>
            <Text style={styles.title}>{title}</Text>
            <Pressable
              onPress={onSubmit}
              style={styles.submitButton}
              testID={testIDPrefix ? `${testIDPrefix}-submit` : undefined}
            >
              <Text style={styles.submitText}>{submitLabel}</Text>
            </Pressable>
          </View>
          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    );
  },
);

FormModal.displayName = "FormModal";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontFamily: "Inter",
    fontSize: 15,
    color: "#999",
  },
  title: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 17,
    color: "#1A1A1A",
  },
  submitButton: {
    backgroundColor: "#FF2D55",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  submitText: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 15,
    color: "#FFFFFF",
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 20,
  },
});
