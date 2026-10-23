import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { compareVersions } from '../utils/versionCompare';

export const GITHUB_OWNER = 'Rulindana';
export const GITHUB_REPO = 'menya-app';

const LATEST_RELEASE_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;
const LAST_CHECK_KEY = 'menya_update_last_check';
const SNOOZE_KEY = 'menya_update_snooze';
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;
const SNOOZE_INTERVAL_MS = 24 * 60 * 60 * 1000;

export interface AppUpdateInfo {
  version: string;
  tag: string;
  notes: string;
  releaseUrl: string;
  apkUrl: string;
  publishedAt: string | null;
}

export const getInstalledVersion = (): string =>
  Application.nativeApplicationVersion ||
  Constants.expoConfig?.version ||
  '0.0.0';

const cleanReleaseNotes = (notes: string): string =>
  notes
    .replace(/\r/g, '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*[-*]\s+/gm, '• ')
    .trim();

export const checkForAppUpdate = async (): Promise<AppUpdateInfo | null> => {
  if (Platform.OS === 'web') return null;

  try {
    const now = Date.now();
    const snoozeRaw = await AsyncStorage.getItem(SNOOZE_KEY);
    if (snoozeRaw) {
      const snooze = JSON.parse(snoozeRaw) as { version?: string; until?: number };
      if (snooze.until && snooze.until > now) return null;
    }

    const lastCheckRaw = await AsyncStorage.getItem(LAST_CHECK_KEY);
    const lastCheck = lastCheckRaw ? parseInt(lastCheckRaw, 10) : 0;
    if (Number.isFinite(lastCheck) && now - lastCheck < CHECK_INTERVAL_MS) {
      return null;
    }

    const response = await fetch(LATEST_RELEASE_URL, {
      headers: {
        Accept: 'application/vnd.github+json',
      },
    });
    await AsyncStorage.setItem(LAST_CHECK_KEY, String(now));

    if (!response.ok) return null;

    const release = await response.json();
    const tag: string = release.tag_name || release.name || '';
    if (!tag) return null;

    const currentVersion = getInstalledVersion();
    if (compareVersions(tag, currentVersion) <= 0) return null;

    const assets: Array<{ name?: string; browser_download_url?: string; state?: string }> =
      Array.isArray(release.assets) ? release.assets : [];
    const apk = assets.find(
      (asset) =>
        (asset.state === undefined || asset.state === 'uploaded') &&
        typeof asset.name === 'string' &&
        asset.name.toLowerCase().endsWith('.apk'),
    );

    return {
      version: tag.replace(/^v/i, ''),
      tag,
      notes: cleanReleaseNotes(release.body || 'Bug fixes and improvements.'),
      releaseUrl: release.html_url,
      apkUrl: apk?.browser_download_url || release.html_url,
      publishedAt: release.published_at || null,
    };
  } catch {
    return null;
  }
};

export const snoozeUpdate = async (version: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      SNOOZE_KEY,
      JSON.stringify({ version, until: Date.now() + SNOOZE_INTERVAL_MS }),
    );
  } catch {
    // A failed snooze only means the user may see the prompt again.
  }
};
