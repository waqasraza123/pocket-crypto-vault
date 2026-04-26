interface NativeRuntimeConstants {
  appOwnership?: string | null;
  expoGoConfig?: unknown;
}

export const isNativeWalletRuntimeSupported = (constants: NativeRuntimeConstants) =>
  constants.appOwnership !== "expo" && !constants.expoGoConfig;
