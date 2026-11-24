export default function globalTeardown(): void {
  globalThis.__INTEGRATION_APP__?.kill();
}
