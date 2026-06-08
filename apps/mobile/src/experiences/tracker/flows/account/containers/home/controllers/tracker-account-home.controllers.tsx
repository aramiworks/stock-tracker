import {
  memo,
  createContext,
  useContext,
  useCallback,
  type ReactNode,
} from "react";
import { useSuspenseQuery } from "@apollo/client/react";
import { ME_QUERY } from "@/lib/graphql/queries";
import { useAuthControllers } from "@/experiences/auth/controllers";
import { unregisterFromPushNotifications } from "@/experiences/notifications";

interface MeQueryData {
  me: {
    id: string;
    email: string;
    createdAt: string;
  } | null;
}

interface TrackerAccountHomeControllersOutput {
  email: string;
  createdAt: string;
  signOut: () => Promise<void>;
  isSigningOut: boolean;
}

const ControllersContext =
  createContext<TrackerAccountHomeControllersOutput | null>(null);

interface TrackerAccountHomeControllersProps {
  children: ReactNode;
}

export const TrackerAccountHomeControllers =
  memo<TrackerAccountHomeControllersProps>(({ children }) => {
    const { data } = useSuspenseQuery<MeQueryData>(ME_QUERY);
    const { signOut, isSigningOut } = useAuthControllers();

    const handleSignOut = useCallback(async () => {
      // Deactivate this device's push token while the JWT is still valid — MUST
      // run before signOut (which clears the session). Best-effort: never block
      // logout on push cleanup; the backend sweep tolerates stale tokens.
      try {
        await unregisterFromPushNotifications();
      } catch {
        // swallow — logout proceeds regardless
      }
      await signOut();
    }, [signOut]);

    const value: TrackerAccountHomeControllersOutput = {
      email: data?.me?.email ?? "",
      createdAt: data?.me?.createdAt ?? "",
      signOut: handleSignOut,
      isSigningOut,
    };

    return (
      <ControllersContext.Provider value={value}>
        {children}
      </ControllersContext.Provider>
    );
  });

TrackerAccountHomeControllers.displayName = "TrackerAccountHomeControllers";

export const useTrackerAccountHomeControllers = () => {
  const context = useContext(ControllersContext);
  if (!context) {
    throw new Error(
      "useTrackerAccountHomeControllers must be used within TrackerAccountHomeControllers",
    );
  }
  return context;
};
