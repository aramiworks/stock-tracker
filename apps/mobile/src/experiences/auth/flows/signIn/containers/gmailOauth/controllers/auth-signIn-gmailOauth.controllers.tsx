import {
  memo,
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Platform } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import {
  GoogleSignin,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import { supabase } from "../../../../../../../lib/supabase";
import { apolloClient } from "../../../../../../../lib/apollo/provider";
import { UpsertUserDocument } from "@/lib/graphql/generated/graphql";

WebBrowser.maybeCompleteAuthSession();

async function upsertUserProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return;
  await apolloClient.mutate({
    mutation: UpsertUserDocument,
    variables: { email: user.email, displayName: user.user_metadata?.name ?? null },
  });
}

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

/* istanbul ignore next -- module-level Platform check; Jest runs with a fixed platform */
if (Platform.OS !== "web") {
  // webClientId: required — Google uses the web client to issue tokens Supabase can verify.
  // iosClientId: iOS OAuth client for the native account picker on iOS.
  // Android uses the Android OAuth client registered in Google Cloud Console
  // (package name + SHA-1 fingerprint) — its client ID is not passed here.
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
  });
}

interface AuthSignInGmailOauthControllersOutput {
  signInWithGoogle: () => void;
  isSigningIn: boolean;
}

const ControllersContext =
  createContext<AuthSignInGmailOauthControllersOutput | null>(null);

interface AuthSignInGmailOauthControllersProps {
  children: ReactNode;
}

export const AuthSignInGmailOauthControllers =
  memo<AuthSignInGmailOauthControllersProps>(({ children }) => {
    const [isSigningIn, setIsSigningIn] = useState(false);
    const isMountedRef = useRef(true);
    useEffect(() => {
      return () => {
        isMountedRef.current = false;
      };
    }, []);

    // Web only: expo-auth-session with web client ID.
    // Native (iOS/Android): GoogleSignin SDK below — hooks must not be called conditionally,
    // so we always call useIdTokenAuthRequest but only use the result on web.
    // request.nonce is the raw (pre-hash) nonce — required by Supabase when the id_token
    // contains a nonce claim (which Google includes when nonce is sent in the auth request).
    const [webRequest, webResponse, webPromptAsync] =
      Google.useIdTokenAuthRequest({
        clientId: GOOGLE_WEB_CLIENT_ID,
      });

    useEffect(() => {
      if (Platform.OS !== "web") return;
      if (webResponse?.type !== "success") return;

      const { id_token } = webResponse.params;
      if (!id_token) return;

      setIsSigningIn(true);
      (async () => {
        try {
          const { error } = await supabase.auth.signInWithIdToken({
            provider: "google",
            token: id_token,
            nonce: webRequest?.nonce,
          });
          if (error) throw error;
          await upsertUserProfile();
        } catch {
          // sign-in failed; auth state unchanged, user stays on sign-in screen
        } finally {
          /* istanbul ignore next -- defensive unmount guard */
          if (isMountedRef.current) setIsSigningIn(false);
        }
      })();
    }, [webResponse, webRequest]);

    const signInWithGoogle = useCallback(async () => {
      setIsSigningIn(true);
      try {
        if (Platform.OS === "web") {
          // Web: trigger the browser OAuth flow; result handled in useEffect above.
          await webPromptAsync?.();
          return;
        }

        // Native: Google Sign-In SDK — no custom URI scheme redirect needed.
        // @react-native-google-signin/google-signin v16 ConfigureParams does not
        // support nonce; nonce verification is handled server-side via skip_nonce_check.
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();
        if (isSuccessResponse(userInfo)) {
          const idToken = userInfo.data?.idToken;
          /* istanbul ignore next -- native SDK always returns idToken on success */
          if (idToken) {
            const { error } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: idToken,
            });
            if (error) throw error;
            await upsertUserProfile();
          }
        }
      } finally {
        /* istanbul ignore next -- defensive unmount guard */
        if (isMountedRef.current) setIsSigningIn(false);
      }
    }, [webPromptAsync]);

    const value: AuthSignInGmailOauthControllersOutput = {
      signInWithGoogle,
      isSigningIn,
    };

    return (
      <ControllersContext.Provider value={value}>
        {children}
      </ControllersContext.Provider>
    );
  });

AuthSignInGmailOauthControllers.displayName = "AuthSignInGmailOauthControllers";

export const useAuthSignInGmailOauthControllers = () => {
  const context = useContext(ControllersContext);
  if (!context) {
    throw new Error(
      "useAuthSignInGmailOauthControllers must be used within AuthSignInGmailOauthControllers",
    );
  }
  return context;
};
