import { useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import { identifyUser, resetAnalytics } from "../../../lib/analytics";
import { identifySentryUser, resetSentryUser } from "../../../lib/sentry";
import { setSession } from "../models/auth.store";

const SESSION_TIMEOUT_MS = 5000;

export const useAuthLifecycle = () => {
  useEffect(() => {
    let settled = false;

    const timeout = setTimeout(() => {
      /* istanbul ignore next -- race-condition guard: covered by "hangs" test but branch still uncovered when getSession resolves first */
      if (!settled) {
        settled = true;
        setSession(null);
      }
    }, SESSION_TIMEOUT_MS);

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!settled) {
          settled = true;
          clearTimeout(timeout);
          setSession(session);
          if (session?.user.id) {
            void identifyUser(session.user.id);
            identifySentryUser(session.user.id);
          }
        }
      })
      .catch(() => {
        /* istanbul ignore next -- race-condition guard: covered by "rejects" test but branch still uncovered when getSession resolves first */
        if (!settled) {
          settled = true;
          clearTimeout(timeout);
          setSession(null);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === "SIGNED_OUT") {
        void resetAnalytics();
        resetSentryUser();
      } else if (session?.user.id) {
        void identifyUser(session.user.id);
        identifySentryUser(session.user.id);
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);
};
