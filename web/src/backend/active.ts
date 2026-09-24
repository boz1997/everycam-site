// The backend this bundle talks to: production. On the local stack's dev server
// (`vite --mode localstack`) vite.config.ts resolves THIS module to ./local.ts
// instead — the only way local.ts can enter a module graph.
export { backend } from './prod';
