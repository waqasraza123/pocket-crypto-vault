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
    name: "Goal Vault Dev",
    shortName: "Goal Vault Dev",
    slug: "goal-vault-dev",
    scheme: "goal-vault-dev",
    iosBundleIdentifier: "com.goalvault.app.dev",
    androidPackage: "com.goalvault.app.dev",
    webTitle: "Goal Vault Dev",
  },
  staging: {
    name: "Goal Vault Staging",
    shortName: "Goal Vault Staging",
    slug: "goal-vault-staging",
    scheme: "goal-vault-staging",
    iosBundleIdentifier: "com.goalvault.app.staging",
    androidPackage: "com.goalvault.app.staging",
    webTitle: "Goal Vault Staging",
  },
  production: {
    name: "Goal Vault",
    shortName: "Goal Vault",
    slug: "goal-vault",
    scheme: "goal-vault",
    iosBundleIdentifier: "com.goalvault.app",
    androidPackage: "com.goalvault.app",
    webTitle: "Goal Vault",
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
  description: "A Base-native USDC savings app that protects one goal with a clear unlock date.",
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
    description: "Protect the money you do not want to break with one Base-native USDC vault at a time.",
    backgroundColor: "#f5f2e8",
    themeColor: "#2f8f5b",
    lang: "en",
  },
  extra: {
    goalVault: {
      appEnvironment: environment,
      deploymentTarget: environment === "development" ? "local" : environment,
      appUrl: process.env.EXPO_PUBLIC_APP_URL || null,
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || null,
      expectedLaunchChainId: environment === "production" ? 8453 : 84532,
      heroTitle: "Protect the money meant for something that matters.",
    },
  },
  plugins: ["expo-router"],
};
