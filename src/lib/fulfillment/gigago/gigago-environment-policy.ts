export type GigagoRuntimeEnvironment = "sandbox" | "production";
export type GigagoOperationMode = "demo" | "live";

export function expectedGigagoEnvironment(
  mode: GigagoOperationMode,
): GigagoRuntimeEnvironment {
  return mode === "demo" ? "sandbox" : "production";
}

export function gigagoEnvironmentMatchesMode(
  environment: GigagoRuntimeEnvironment,
  mode: GigagoOperationMode,
): boolean {
  return environment === expectedGigagoEnvironment(mode);
}
