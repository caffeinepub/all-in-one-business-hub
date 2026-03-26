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

async function createAuthClient(
  createOptions?: AuthClientCreateOptions,
): Promise<AuthClient> {
  const options: AuthClientCreateOptions = {
    idleOptions: {
      disableDefaultIdleCallback: true,
      disableIdle: true,
      ...createOptions?.idleOptions,
    },
    ...createOptions,
  };
  return AuthClient.create(options);
}

function assertProviderPresent(
  context: ProviderValue | undefined,
): asserts context is ProviderValue {
  if (!context) {
    throw new Error(
      "InternetIdentityProvider is not present. Wrap your component tree with it.",
    );
  }
}

export const useInternetIdentity = (): InternetIdentityContext => {
  const context = useContext(InternetIdentityReactContext);
  assertProviderPresent(context);
  return context;
};

export function InternetIdentityProvider({
  children,
  createOptions,
}: PropsWithChildren<{
  children: ReactNode;
  createOptions?: AuthClientCreateOptions;
}>) {
  const authClientRef = useRef<AuthClient | undefined>(undefined);
  const [identity, setIdentity] = useState<Identity | undefined>(undefined);
  const [loginStatus, setStatus] = useState<Status>("initializing");
  const [loginError, setError] = useState<Error | undefined>(undefined);

  const setErrorMessage = useCallback((message: string) => {
    setStatus("loginError");
    setError(new Error(message));
  }, []);

  const createOptionsRef = useRef(createOptions);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally runs once on mount
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const client = await createAuthClient(createOptionsRef.current);
        if (cancelled) return;
        authClientRef.current = client;
        const isAuthenticated = await client.isAuthenticated();
        if (cancelled) return;
        if (isAuthenticated) {
          setIdentity(client.getIdentity());
          setStatus("success");
        } else {
          setStatus("idle");
        }
      } catch (unknownError) {
        if (!cancelled) {
          setStatus("loginError");
          setError(
            unknownError instanceof Error
              ? unknownError
              : new Error("Initialization failed"),
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(() => {
    const authClient = authClientRef.current;
    if (!authClient) {
      setErrorMessage(
        "AuthClient is not initialized yet, make sure to call login on user interaction.",
      );
      return;
    }

    const currentIdentity = authClient.getIdentity();
    if (
      !currentIdentity.getPrincipal().isAnonymous() &&
      currentIdentity instanceof DelegationIdentity &&
      isDelegationValid(currentIdentity.getDelegation())
    ) {
      setErrorMessage("User is already authenticated");
      return;
    }

    const options: AuthClientLoginOptions = {
      identityProvider: DEFAULT_IDENTITY_PROVIDER,
      onSuccess: () => {
        const latestIdentity = authClientRef.current?.getIdentity();
        if (!latestIdentity) {
          setErrorMessage("Identity not found after successful login");
          return;
        }
        setIdentity(latestIdentity);
        setStatus("success");
      },
      onError: (maybeError?: string) => {
        setErrorMessage(maybeError ?? "Login failed");
      },
      maxTimeToLive: ONE_HOUR_IN_NANOSECONDS * BigInt(24 * 30),
    };

    setStatus("logging-in");
    void authClient.login(options);
  }, [setErrorMessage]);

  const clear = useCallback(() => {
    const authClient = authClientRef.current;
    if (!authClient) {
      setErrorMessage("Auth client not initialized");
      return;
    }

    void authClient
      .logout()
      .then(() => {
        setIdentity(undefined);
        setStatus("idle");
        setError(undefined);
        void createAuthClient().then((newClient) => {
          authClientRef.current = newClient;
        });
      })
      .catch((unknownError: unknown) => {
        setStatus("loginError");
        setError(
          unknownError instanceof Error
            ? unknownError
            : new Error("Logout failed"),
        );
      });
  }, [setErrorMessage]);

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
