import { z } from "zod";

// -- Push device (Expo push token registration) ----------------------------
//
// A device registers its Expo push token after the user grants notification
// permission. The token is the delivery address for restock push alerts.
// `platform` lets the dispatcher tailor payloads / debug per-OS delivery.

export const pushDevicePlatformSchema = z.enum(["ios", "android"]);

export const pushDeviceRegisterInputSchema = z.object({
  // Expo tokens look like "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]". We keep
  // validation loose (non-empty, bounded) rather than format-strict: a bogus
  // token simply fails at send time and gets deactivated via DeviceNotRegistered.
  expoToken: z.string().min(1).max(512),
  platform: pushDevicePlatformSchema,
});

export const pushDeviceRegisterOutputSchema = z.object({
  registered: z.literal(true),
});

export const pushDeviceUnregisterInputSchema = z.object({
  expoToken: z.string().min(1).max(512),
});

export const pushDeviceUnregisterOutputSchema = z.object({
  unregistered: z.boolean(),
});
