import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

// Import the module once — createClient mock is called at module load
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { supabase } = require("./client");

// Capture the args from the initial createClient call
const initialCallArgs = (createClient as jest.Mock).mock.calls[0]!;
const authOptions = initialCallArgs[2];

describe("supabase client", () => {
  it("creates a client via createClient", () => {
    expect(createClient).toHaveBeenCalled();
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
  });

  it("configures auth with correct options", () => {
    expect(authOptions.auth).toEqual(
      expect.objectContaining({
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      }),
    );
  });

  it("uses SecureStore adapter on non-web platform", () => {
    const storage = authOptions.auth.storage;
    expect(storage.getItem).toBeDefined();
    expect(storage.setItem).toBeDefined();
    expect(storage.removeItem).toBeDefined();
  });

  it("SecureStore adapter delegates to expo-secure-store", async () => {
    const SecureStore = require("expo-secure-store");
    const storage = authOptions.auth.storage;

    await storage.getItem("test-key");
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith("test-key");

    await storage.setItem("test-key", "test-value");
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      "test-key",
      "test-value",
    );

    await storage.removeItem("test-key");
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("test-key");
  });

  it("uses WebStorage adapter on web platform", () => {
    jest.isolateModules(() => {
      jest.replaceProperty(Platform, "OS", "web" as typeof Platform.OS);

      const mockGetItem = jest.fn().mockReturnValue("value");
      const mockSetItem = jest.fn();
      const mockRemoveItem = jest.fn();
      Object.defineProperty(global, "localStorage", {
        value: {
          getItem: mockGetItem,
          setItem: mockSetItem,
          removeItem: mockRemoveItem,
        },
        configurable: true,
      });

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("./client");
      const webCallArgs = (createClient as jest.Mock).mock.calls.at(-1)!;
      const webStorage = webCallArgs[2].auth.storage;

      webStorage.getItem("key");
      expect(mockGetItem).toHaveBeenCalledWith("key");

      webStorage.setItem("key", "val");
      expect(mockSetItem).toHaveBeenCalledWith("key", "val");

      webStorage.removeItem("key");
      expect(mockRemoveItem).toHaveBeenCalledWith("key");
    });
  });

  it("rewrites localhost to 10.0.2.2 on Android in dev mode", () => {
    jest.isolateModules(() => {
      jest.replaceProperty(Platform, "OS", "android" as typeof Platform.OS);
      process.env.EXPO_PUBLIC_SUPABASE_URL = "http://localhost:54321";
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("./client");
      const androidCallArgs = (createClient as jest.Mock).mock.calls.at(-1)!;
      expect(androidCallArgs[0]).toBe("http://10.0.2.2:54321");
    });
  });
});
