import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from "react";
import { View, type ViewStyle } from "react-native";
import type { ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { isAppLocale, resolveInitialLocale, shouldApplyHydratedLocale } from "./locale-storage";

import { getLocaleDirection, getLocaleMessages, interpolate, isLocaleRtl, type AppDirection, type AppLocale, type AppMessages } from "./messages";

export { getLocaleDirection, getLocaleMessages, interpolate, isLocaleRtl } from "./messages";
export type { AppDirection, AppLocale, AppMessages } from "./messages";

const localeStorageKey = "@pocket-vault/locale";

const directionalIconMap: Partial<Record<ComponentProps<typeof MaterialCommunityIcons>["name"], ComponentProps<typeof MaterialCommunityIcons>["name"]>> =
  {
    "arrow-right": "arrow-left",
    "arrow-left": "arrow-right",
    "arrow-top-right": "arrow-top-left",
    "arrow-top-left": "arrow-top-right",
    "chevron-left": "chevron-right",
    "chevron-right": "chevron-left",
  };

export const resolveDirectionalIcon = (
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"] | undefined,
  isRTL: boolean,
) => {
  if (!icon || !isRTL) {
    return icon;
  }

  return directionalIconMap[icon] ?? icon;
};

export const getInlineDirection = (isRTL: boolean, reversed = false): ViewStyle["flexDirection"] =>
  isRTL ? (reversed ? "row" : "row-reverse") : reversed ? "row-reverse" : "row";

type I18nContextValue = {
  locale: AppLocale;
  isRTL: boolean;
  direction: AppDirection;
  messages: AppMessages;
  setLocale: (locale: AppLocale) => void;
  isHydrated: boolean;
};

const I18nContext = createContext<I18nContextValue | null>(null);

let currentLocale: AppLocale = "en";

const getWebStoredLocale = (): AppLocale | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedLocale = window.localStorage.getItem(localeStorageKey);
    return storedLocale === "en" || storedLocale === "ar" ? storedLocale : null;
  } catch {
    return null;
  }
};

const setWebStoredLocale = (locale: AppLocale) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(localeStorageKey, locale);
  } catch {}
};

export const getCurrentLocale = () => currentLocale;

export const getCurrentMessages = () => getLocaleMessages(currentLocale);

export const getCurrentLocaleTag = () => getCurrentMessages().dateLocale;

export const LocaleProvider = ({ children }: PropsWithChildren) => {
  const [locale, setLocaleState] = useState<AppLocale>(() => resolveInitialLocale(getWebStoredLocale()));
  const [isHydrated, setIsHydrated] = useState(false);
  const hasManualSelectionRef = useRef(false);

  useEffect(() => {
    currentLocale = locale;
  }, [locale]);

  useEffect(() => {
    let isActive = true;

    void AsyncStorage.getItem(localeStorageKey)
      .then((storedLocale) => {
        if (!isActive) {
          return;
        }

        if (shouldApplyHydratedLocale({ hydratedLocale: storedLocale, hasManualSelection: hasManualSelectionRef.current }) && isAppLocale(storedLocale)) {
          setLocaleState(storedLocale);
          currentLocale = storedLocale;
        }
      })
      .finally(() => {
        if (isActive) {
          setIsHydrated(true);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    void AsyncStorage.setItem(localeStorageKey, locale);
  }, [isHydrated, locale]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const direction = getLocaleDirection(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
    document.body.lang = locale;
    document.body.dir = direction;
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      isRTL: isLocaleRtl(locale),
      direction: getLocaleDirection(locale),
      messages: getLocaleMessages(locale),
      setLocale: (nextLocale) => {
        hasManualSelectionRef.current = true;
        currentLocale = nextLocale;
        setLocaleState(nextLocale);
        setWebStoredLocale(nextLocale);
      },
      isHydrated,
    }),
    [isHydrated, locale],
  );

  return (
    <I18nContext.Provider value={value}>
      <View style={{ flex: 1, direction: value.direction }}>{children}</View>
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within LocaleProvider.");
  }

  return {
    ...context,
    formatMessage: (template: string, values: Record<string, string | number>) => interpolate(template, values),
    getDirectionalIcon: (icon: ComponentProps<typeof MaterialCommunityIcons>["name"] | undefined) =>
      resolveDirectionalIcon(icon, context.isRTL),
    inlineDirection: (reversed = false) => getInlineDirection(context.isRTL, reversed),
    textAlignStart: context.isRTL ? ("right" as const) : ("left" as const),
    textAlignEnd: context.isRTL ? ("left" as const) : ("right" as const),
    justifyStart: context.isRTL ? ("flex-end" as const) : ("flex-start" as const),
    justifyEnd: context.isRTL ? ("flex-start" as const) : ("flex-end" as const),
  };
};
