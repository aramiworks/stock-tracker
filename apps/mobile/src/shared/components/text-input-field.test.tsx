import React from "react";
import { render } from "@testing-library/react-native";
import { useForm } from "react-hook-form";
import { TextInputField } from "./text-input-field";

function TestWrapper() {
  const { control } = useForm({ defaultValues: { name: "" } });
  return (
    <TextInputField
      control={control}
      name="name"
      label="Name"
      placeholder="Enter name"
      testID="name-field"
    />
  );
}

describe("TextInputField", () => {
  it("renders without crashing", () => {
    const { getByTestId } = render(<TestWrapper />);
    expect(getByTestId("name-field")).toBeTruthy();
  });
});
