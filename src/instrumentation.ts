/**
 * Next.js instrumentation file.
 * The register() function runs once on server startup when the environment is ready.
 */
export async function register(): Promise<void> {
  // Only execute server-side initialization inside the Node.js runtime environment.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { initializeAI } = await import("@/core/services/ai/init");
      await initializeAI();
    } catch (error) {
      console.error("Failed to execute initializeAI inside Next.js instrumentation hook:", error);
    }
  }
}
