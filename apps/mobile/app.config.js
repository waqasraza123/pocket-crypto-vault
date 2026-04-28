const resolveEnvironment = () => {
  const appEnv = process.env.EXPO_PUBLIC_APP_ENV || process.env.APP_ENV || process.env.NODE_ENV;

  if (appEnv === "staging") {
    return "staging";
  }

  if (appEnv === "production") {
    return "production";
  }

  return "development";
};

const environment = resolveEnvironment();
const appIdentityByEnvironment = {
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
const appIdentity = appIdentityByEnvironment[environment];
const version = process.env.npm_package_version?.trim() || "0.1.0";
const iosBuildNumber = process.env.IOS_BUILD_NUMBER?.trim() || "1";
const androidVersionCode = Number.parseInt(process.env.ANDROID_VERSION_CODE || "1", 10) || 1;

module.exports = {
  name: appIdentity.name,
  slug: appIdentity.slug,
  scheme: appIdentity.scheme,
  description: "A Base-native USDC pocket-money savings app for students building an emergency buffer.",
  version,
  orientation: "portrait",
  userInterfaceStyle: "light",
  runtimeVersion: {
    policy: "appVersion",
  },
  splash: {
    backgroundColor: "#f5f2e8",
  },
  experiments: {
    typedRoutes: true,
  },
  platforms: ["ios", "android", "web"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: appIdentity.iosBundleIdentifier,
    buildNumber: iosBuildNumber,
  },
  android: {
    package: appIdentity.androidPackage,
    versionCode: androidVersionCode,
  },
  web: {
    bundler: "metro",
    output: "static",
    name: appIdentity.webTitle,
    shortName: appIdentity.shortName,
    description: "Save student pocket money in USDC on Base with one protected vault at a time.",
    backgroundColor: "#f5f2e8",
    themeColor: "#2f8f5b",
    lang: "en",
  },
  extra: {
    pocketVault: {
      appEnvironment: environment,
      deploymentTarget: environment === "development" ? "local" : environment,
      appUrl: process.env.EXPO_PUBLIC_APP_URL || null,
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || null,
      expectedLaunchChainId: environment === "production" ? 8453 : 84532,
      heroTitle: "Save pocket money in crypto for the moments that matter.",
    },
  },
  plugins: ["expo-router"],
};
