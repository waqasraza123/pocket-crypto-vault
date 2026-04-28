import type { AppEnvironment } from "@pocket-vault/shared";

export interface PocketVaultAppIdentity {
  name: string;
  shortName: string;
  slug: string;
  scheme: string;
  iosBundleIdentifier: string;
  androidPackage: string;
  webTitle: string;
}

const appIdentityByEnvironment: Record<AppEnvironment, PocketVaultAppIdentity> = {
  development: {
    name: "Pocket Vault Dev",
    shortName: "Pocket Vault Dev",
    slug: "pocket-vault-dev",
    scheme: "pocket-vault-dev",
    iosBundleIdentifier: "com.pocketvault.app.dev",
    androidPackage: "com.pocketvault.app.dev",
    webTitle: "Pocket Vault Dev",
  },
  staging: {
    name: "Pocket Vault Staging",
    shortName: "Pocket Vault Staging",
    slug: "pocket-vault-staging",
    scheme: "pocket-vault-staging",
    iosBundleIdentifier: "com.pocketvault.app.staging",
    androidPackage: "com.pocketvault.app.staging",
    webTitle: "Pocket Vault Staging",
  },
  production: {
    name: "Pocket Vault",
    shortName: "Pocket Vault",
    slug: "pocket-vault",
    scheme: "pocket-vault",
    iosBundleIdentifier: "com.pocketvault.app",
    androidPackage: "com.pocketvault.app",
    webTitle: "Pocket Vault",
  },
};

export const getPocketVaultAppIdentity = (environment: AppEnvironment): PocketVaultAppIdentity =>
  appIdentityByEnvironment[environment];
