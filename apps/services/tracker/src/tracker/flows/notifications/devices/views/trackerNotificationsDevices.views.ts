import {
  pushDeviceRegisterInputSchema,
  pushDeviceRegisterOutputSchema,
  pushDeviceUnregisterInputSchema,
  pushDeviceUnregisterOutputSchema,
} from "@stock-tracker/validation";

export const trackerNotificationsDevicesViews = {
  register: {
    input: pushDeviceRegisterInputSchema,
    output: pushDeviceRegisterOutputSchema,
  },
  unregister: {
    input: pushDeviceUnregisterInputSchema,
    output: pushDeviceUnregisterOutputSchema,
  },
};
