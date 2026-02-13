// Next.js instrumentation hook
// This file is automatically called by Next.js when the server starts

export async function register() {
  // Only run on server
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initializeInfrastructure } = await import('./infrastructure');
    await initializeInfrastructure();
  }
}
