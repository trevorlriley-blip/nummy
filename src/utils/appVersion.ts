import Constants from 'expo-constants';
import * as Application from 'expo-application';
import * as Updates from 'expo-updates';

export interface VersionInfo {
  /** Marketing version from app.json, e.g. "1.2.0". */
  version: string;
  /** Native build number (increments with every EAS build); null where unavailable (dev client / Expo Go). */
  build: string | null;
  /** OTA update channel, e.g. "preview". */
  channel: string | null;
  /** Id of the running OTA update; null when running the build's embedded JS. */
  updateId: string | null;
  /** When the running OTA update was published. */
  updatedAt: Date | null;
}

export function getVersionInfo(): VersionInfo {
  let build: string | null = null;
  try {
    build = Application.nativeBuildVersion ?? null;
  } catch {}

  let updateId: string | null = null;
  let updatedAt: Date | null = null;
  let channel: string | null = null;
  try {
    if (!Updates.isEmbeddedLaunch) {
      updateId = Updates.updateId ?? null;
      updatedAt = Updates.createdAt ?? null;
    }
    channel = Updates.channel ?? null;
  } catch {}

  return { version: Constants.expoConfig?.version ?? '?', build, channel, updateId, updatedAt };
}

/** "v1.2.0 (24)" */
export function versionLabel(v: VersionInfo = getVersionInfo()): string {
  return `v${v.version}${v.build ? ` (${v.build})` : ''}`;
}

/** "Update 01a20a8a · Nov 23, 3:32 PM" for OTA updates, otherwise "Original build". */
export function updateLabel(v: VersionInfo = getVersionInfo()): string {
  if (!v.updateId) return 'Original build';
  const when = v.updatedAt
    ? ` · ${v.updatedAt.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`
    : '';
  return `Update ${v.updateId.slice(0, 8)}${when}`;
}

/** One line for logs and shared text: "Nummy v1.2.0 (24) · Update 01a20a8a · Nov 23, 3:32 PM · preview" */
export function versionSummary(v: VersionInfo = getVersionInfo()): string {
  return ['Nummy', versionLabel(v), updateLabel(v), v.channel].filter(Boolean).join(' · ').replace('Nummy · ', 'Nummy ');
}
