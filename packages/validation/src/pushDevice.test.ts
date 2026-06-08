import { describe, expect, it } from "@jest/globals";
import {
  pushDeviceRegisterInputSchema,
  pushDeviceUnregisterInputSchema,
} from "./pushDevice.js";

const validToken = "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]";

describe("pushDeviceRegisterInputSchema", () => {
  it("accepts a valid Expo token + platform", () => {
    const result = pushDeviceRegisterInputSchema.parse({
      expoToken: validToken,
      platform: "ios",
    });
    expect(result.expoToken).toBe(validToken);
    expect(result.platform).toBe("ios");
  });

  it("accepts android platform", () => {
    expect(() =>
      pushDeviceRegisterInputSchema.parse({
        expoToken: validToken,
        platform: "android",
      }),
    ).not.toThrow();
  });

  it("rejects an empty token", () => {
    expect(() =>
      pushDeviceRegisterInputSchema.parse({ expoToken: "", platform: "ios" }),
    ).toThrow();
  });

  it("rejects an unknown platform", () => {
    expect(() =>
      pushDeviceRegisterInputSchema.parse({
        expoToken: validToken,
        platform: "web",
      }),
    ).toThrow();
  });
});

describe("pushDeviceUnregisterInputSchema", () => {
  it("accepts a token", () => {
    expect(
      pushDeviceUnregisterInputSchema.parse({ expoToken: validToken })
        .expoToken,
    ).toBe(validToken);
  });

  it("rejects an empty token", () => {
    expect(() =>
      pushDeviceUnregisterInputSchema.parse({ expoToken: "" }),
    ).toThrow();
  });
});
