// Run the unmodified Next CLI with telemetry disabled on every supported shell.
process.env.NEXT_TELEMETRY_DISABLED = "1";
await import("next/dist/bin/next");
