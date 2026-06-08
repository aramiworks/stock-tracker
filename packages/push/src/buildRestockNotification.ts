/**
 * Korean restock push copy. The app is ko-only and a killed-app push can't be
 * localized on-device, so the backend owns the rendered title/body. Mobile keeps
 * its own ko copy for the in-app banner (minor, accepted duplication).
 */

export interface RestockNotificationInput {
  brand: string;
  modelName: string;
}

export interface RestockNotificationCopy {
  title: string;
  body: string;
}

export function buildRestockNotification({
  brand,
  modelName,
}: RestockNotificationInput): RestockNotificationCopy {
  return {
    title: "재입고 알림",
    body: `${brand} ${modelName} 재입고되었습니다`,
  };
}
