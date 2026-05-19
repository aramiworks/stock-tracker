import {
  alertHistoryListInputSchema,
  alertHistoryListOutputSchema,
} from "@stock-tracker/validation";

export const trackerAlertHistoryBrowseViews = {
  list: {
    input: alertHistoryListInputSchema,
    output: alertHistoryListOutputSchema,
  },
};
