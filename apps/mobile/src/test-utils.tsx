import React from "react";
import { render, type RenderOptions } from "@testing-library/react-native";
import { TamaguiProvider } from "tamagui";
import { config } from "@aramiworks/ui";

function Providers({ children }: { children: React.ReactNode }) {
  return <TamaguiProvider config={config}>{children}</TamaguiProvider>;
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: Providers, ...options });
}

export { render } from "@testing-library/react-native";
