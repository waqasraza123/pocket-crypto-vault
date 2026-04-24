import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { WalletProvider } from "../lib/blockchain/wallet";
import { AnalyticsProvider } from "../lib/analytics";
import { LocaleProvider } from "../lib/i18n";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LocaleProvider>
        <AnalyticsProvider>
          <WalletProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(marketing)" />
              <Stack.Screen name="(app)" />
            </Stack>
          </WalletProvider>
        </AnalyticsProvider>
      </LocaleProvider>
    </SafeAreaProvider>
  );
}
