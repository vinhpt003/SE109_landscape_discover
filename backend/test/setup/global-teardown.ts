/**
 * Jest globalTeardown  —  runs once after every test suite completes.
 *
 * Stops and removes the PostgreSQL container that was started by global-setup.ts.
 */
export default async function globalTeardown() {
  const container = global.__TC_CONTAINER__;
  if (container) {
    console.log('\n🛑  Stopping PostgreSQL test container...');
    await container.stop({ timeout: 10 });
    console.log('✅  Container stopped.\n');
  }
}
