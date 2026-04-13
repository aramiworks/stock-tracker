import { memo } from "react";
import { View, TextInput, StyleSheet } from "react-native";

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  testID?: string;
};

export const SearchBar = memo(
  ({
    value,
    onChangeText,
    placeholder = "검색...",
    testID = "search-bar",
  }: SearchBarProps) => {
    return (
      <View style={styles.container}>
        <TextInput
          testID={testID}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          clearButtonMode="while-editing"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>
    );
  },
);

SearchBar.displayName = "SearchBar";

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    paddingHorizontal: 14,
    fontFamily: "Inter",
    fontSize: 14,
    color: "#1A1A1A",
    backgroundColor: "#FFFFFF",
  },
});
