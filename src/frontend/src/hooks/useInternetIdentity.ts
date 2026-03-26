import {
  AuthClient,
  type AuthClientCreateOptions,
  type AuthClientLoginOptions,
} from "@dfinity/auth-client";
import type { Identity } from "@icp-sdk/core/agent";
import { DelegationIdentity, isDelegationValid } from "@icp-sdk/core/identity";
import {
  type PropsWithChildren,
  type ReactNode,
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type Status =
  | "initializing"
  | "idle"
  | "logging-in"
  | "success"
  | "loginError";

export type InternetIdentityContext = {
  identity?: Identity;
  login: () => void;
  clear: () => void;
  loginStatus: Status;
  isInitializing: boolean;
  isLoginIdle: boolean;
  isLoggingIn: boolean;
  isLoginSuccess: boolean;
  isLoginError: boolean;
  loginError?: Error;
};

const ONE_HOUR_IN_NANOSECONDS = BigInt(3_600_000_000_000);
const DEFAULT_IDENTITY_PROVIDER = process.env.II_URL;

type ProviderValue = InternetIdentityContext;
const InternetIdentityReactContext = createContext<ProviderValue | undefined>(
  undefined,
);

export const useInternetIdentity = (): InternetIdentityContext => {
  const context = useContext(InternetIdentityReactContext);
  if (!context) {
    throw new Error(
      "InternetIdentityProvider is not present. Wrap your component tree with it.",
    );
  }
  return context;
};

export function InternetIdentityProvider({
  children,
  createOptions,
}: PropsWithChildren<{
  children: ReactNode;
  createOptions?: AuthClientCreateOptions;
}>) {
  const clientRef = useRef<AuthClient | null>(null);
  const initializedRef = useRef(false);
  // Capture createOptions in a ref so the effect doesn't need it as a dep
  const createOptionsRef = useRef<AuthClientCreateOptions | undefined>(
    createOptions,
  );
  const [identity, setIdentity] = useState<Identity | undefined>(undefined);
  const [loginStatus, setStatus] = useState<Status>("initializing");
  const [loginError, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    let mounted = true;
    const opts = createOptionsRef.current;

    AuthClient.create({
      idleOptions: {
        disableDefaultIdleCallback: true,
        disableIdle: true,
        ...opts?.idleOptions,
      },
      ...opts,
    })
      .then((client) => {
        if (!mounted) return;
        clientRef.current = client;
        return client.isAuthenticated().then((isAuth) => {
          if (!mounted) return;
          if (isAuth) {
            setIdentity(client.getIdentity());
          }
          setStatus("idle");
        });
      })
      .catch(() => {
        if (!mounted) return;
        setStatus("idle");
      });

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(() => {
    const client = clientRef.current;
    if (!client) {
      setStatus("loginError");
      setError(new Error("AuthClient not initialized"));
      return;
    }

    const currentIdentity = client.getIdentity();
    if (
      !currentIdentity.getPrincipal().isAnonymous() &&
      currentIdentity instanceof DelegationIdentity &&
      isDelegationValid(currentIdentity.getDelegation())
    ) {
      setStatus("success");
      setIdentity(currentIdentity);
      return;
    }

    const options: AuthClientLoginOptions = {
      identityProvider: DEFAULT_IDENTITY_PROVIDER,
      onSuccess: () => {
        const latestIdentity = clientRef.current?.getIdentity();
        if (latestIdentity) {
          setIdentity(latestIdentity);
          setStatus("success");
        } else {
          setStatus("loginError");
          setError(new Error("Identity not found after login"));
        }
      },
      onError: (msg) => {
        setStatus("loginError");
        setError(new Error(msg ?? "Login failed"));
      },
      maxTimeToLive: ONE_HOUR_IN_NANOSECONDS * BigInt(24 * 30),
    };

    setStatus("logging-in");
    void client.login(options);
  }, []);

  const clear = useCallback(() => {
    const client = clientRef.current;
    if (!client) return;

    void client
      .logout()
      .then(() => {
        clientRef.current = null;
        initializedRef.current = false;
        setIdentity(undefined);
        setStatus("idle");
        setError(undefined);
        AuthClient.create({
          idleOptions: { disableDefaultIdleCallback: true, disableIdle: true },
        })
          .then((newClient) => {
            clientRef.current = newClient;
            initializedRef.current = true;
          })
          .catch(() => {});
      })
      .catch((err: unknown) => {
        setStatus("loginError");
        setError(err instanceof Error ? err : new Error("Logout failed"));
      });
  }, []);

  const value = useMemo<ProviderValue>(
    () => ({
      identity,
      login,
      clear,
      loginStatus,
      isInitializing: loginStatus === "initializing",
      isLoginIdle: loginStatus === "idle",
      isLoggingIn: loginStatus === "logging-in",
      isLoginSuccess: loginStatus === "success",
      isLoginError: loginStatus === "loginError",
      loginError,
    }),
    [identity, login, clear, loginStatus, loginError],
  );

  return createElement(InternetIdentityReactContext.Provider, {
    value,
    children,
  });
}
