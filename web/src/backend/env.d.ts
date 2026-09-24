// Build-time variables the web pages read (Vite `import.meta.env`).
//   VITE_PADDLE_TOKEN_SANDBOX / VITE_PADDLE_TOKEN_LIVE — Paddle client-side tokens
//     (public by design); absent = the dashboard shows "coming soon".
//   VITE_APPLE_WEB=1 — web Sign in with Apple is configured (D3, go-live E1).
//   VITE_LOCAL_* — the local stack only (.env.localstack, `--mode localstack`).
interface ImportMetaEnv {
  readonly VITE_PADDLE_TOKEN_SANDBOX?: string;
  readonly VITE_PADDLE_TOKEN_LIVE?: string;
  readonly VITE_APPLE_WEB?: string;
  readonly VITE_LOCAL_STACK?: string;
  readonly VITE_LOCAL_AUTH_PORT?: string;
  readonly VITE_LOCAL_FIRESTORE_PORT?: string;
  readonly VITE_LOCAL_FUNCTIONS_PORT?: string;
  readonly VITE_LOCAL_STORAGE_PORT?: string;
  readonly VITE_LOCAL_MOCK_PORT?: string;
  readonly VITE_LOCAL_SITE_ORIGIN?: string;
  readonly VITE_LOCAL_WEB_ORIGIN?: string;
}
