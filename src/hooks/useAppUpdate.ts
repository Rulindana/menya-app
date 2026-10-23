import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking } from 'react-native';
import {
  AppUpdateInfo,
  checkForAppUpdate,
  snoozeUpdate,
} from '../services/appUpdate';

export const useAppUpdate = () => {
  const [update, setUpdate] = useState<AppUpdateInfo | null>(null);
  const checking = useRef(false);

  const runCheck = useCallback(async () => {
    if (checking.current) return;
    checking.current = true;
    try {
      const result = await checkForAppUpdate();
      if (result) setUpdate(result);
    } finally {
      checking.current = false;
    }
  }, []);

  useEffect(() => {
    runCheck();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') runCheck();
    });
    return () => subscription.remove();
  }, [runCheck]);

  const openUpdate = useCallback(async () => {
    if (!update) return;
    const url = update.apkUrl || update.releaseUrl;
    setUpdate(null);
    try {
      await Linking.openURL(url);
    } catch {
      try {
        await Linking.openURL(update.releaseUrl);
      } catch {
        // The release URL is the final fallback.
      }
    }
  }, [update]);

  const dismissUpdate = useCallback(async () => {
    if (!update) return;
    const version = update.version;
    setUpdate(null);
    await snoozeUpdate(version);
  }, [update]);

  return {
    update,
    openUpdate,
    dismissUpdate,
  };
};
