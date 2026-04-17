const CACHE_PREFIX = 'investwise:session-cache:v1';

function getStorage() {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage;
}

function getCurrentScope() {
  if (typeof window === 'undefined') return 'guest';

  try {
    const rawUser = window.localStorage.getItem('user');
    if (!rawUser) return 'guest';

    const user = JSON.parse(rawUser);
    const identifier =
      user?.id ||
      user?.email ||
      user?.username ||
      user?.fullName ||
      user?.role ||
      'guest';

    return String(identifier)
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'guest';
  } catch {
    return 'guest';
  }
}

function buildStorageKey(key) {
  return `${CACHE_PREFIX}:${getCurrentScope()}:${key}`;
}

export function createSessionCacheKey(baseKey, params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([left], [right]) => left.localeCompare(right))
    .forEach(([key, value]) => {
      searchParams.set(key, String(value));
    });

  const query = searchParams.toString();
  return query ? `${baseKey}?${query}` : baseKey;
}

export function readSessionCache(key, { ttlMs } = {}) {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const rawValue = storage.getItem(buildStorageKey(key));
    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue);
    if (!parsed || typeof parsed !== 'object') {
      storage.removeItem(buildStorageKey(key));
      return null;
    }

    if (ttlMs && parsed.savedAt && Date.now() - parsed.savedAt > ttlMs) {
      storage.removeItem(buildStorageKey(key));
      return null;
    }

    return parsed.data ?? null;
  } catch {
    storage.removeItem(buildStorageKey(key));
    return null;
  }
}

export function writeSessionCache(key, data) {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(
      buildStorageKey(key),
      JSON.stringify({
        savedAt: Date.now(),
        data,
      })
    );
  } catch {
    // Ignore storage quota and serialization failures.
  }
}

export function removeSessionCache(key) {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(buildStorageKey(key));
}

export function clearSessionCacheByPrefix(prefix) {
  const storage = getStorage();
  if (!storage) return;

  const scopedPrefix = buildStorageKey(prefix);
  const keysToRemove = [];

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key?.startsWith(scopedPrefix)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => storage.removeItem(key));
}

export const sessionCacheKeys = {
  publicFunds: (params = {}) => createSessionCacheKey('funds:public', params),
  fundDetail: (id) => `funds:detail:${id}`,
  investorBundle: 'investor:bundle',
  advisorHubBundle: 'advisor:hub',
  advisorDetail: (id) => `advisor:detail:${id}`,
  advisorAvailability: (id) => `advisor:availability:${id}`,
  advisorWorkspaceBundle: 'advisor:workspace',
  adminBundle: 'admin:bundle',
  adminStats: 'admin:stats',
};
