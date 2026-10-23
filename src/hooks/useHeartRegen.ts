import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useAppStore } from '../store/useAppStore';

export const useHeartRegen = () => {
  const applyHeartRegen = useAppStore((s) => s.applyHeartRegen);

  useEffect(() => {
    applyHeartRegen();

    const interval = setInterval(applyHeartRegen, 10000);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') applyHeartRegen();
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [applyHeartRegen]);
};
