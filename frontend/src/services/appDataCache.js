import api from './api';
import {
  readSessionCache,
  sessionCacheKeys,
  writeSessionCache,
} from './sessionCache';

export const SESSION_CACHE_TTLS = {
  publicFunds: 5 * 60 * 1000,
  investorBundle: 2 * 60 * 1000,
  advisorHubBundle: 2 * 60 * 1000,
  advisorDetail: 2 * 60 * 1000,
  advisorAvailability: 60 * 1000,
  advisorWorkspaceBundle: 60 * 1000,
  adminBundle: 60 * 1000,
  adminStats: 60 * 1000,
};

const swallowPrefetchError = () => {};

async function loadSessionResource(key, ttlMs, fetcher, { forceRefresh = false } = {}) {
  if (!forceRefresh) {
    const cachedData = readSessionCache(key, { ttlMs });
    if (cachedData) {
      return {
        data: cachedData,
        fromCache: true,
      };
    }
  }

  const data = await fetcher();
  writeSessionCache(key, data);

  return {
    data,
    fromCache: false,
  };
}

export function getCachedPublicFunds(params = {}) {
  return readSessionCache(sessionCacheKeys.publicFunds(params), {
    ttlMs: SESSION_CACHE_TTLS.publicFunds,
  });
}

export async function fetchPublicFunds(params = {}, options = {}) {
  return loadSessionResource(
    sessionCacheKeys.publicFunds(params),
    SESSION_CACHE_TTLS.publicFunds,
    async () => {
      const response = await api.get('/mf/all', {
        params: {
          limit: 24,
          ...params,
        },
      });
      return response.data;
    },
    options
  );
}

export function getCachedInvestorBundle() {
  return readSessionCache(sessionCacheKeys.investorBundle, {
    ttlMs: SESSION_CACHE_TTLS.investorBundle,
  });
}

export async function fetchInvestorBundle(options = {}) {
  return loadSessionResource(
    sessionCacheKeys.investorBundle,
    SESSION_CACHE_TTLS.investorBundle,
    async () => {
      const [profileResponse, historyResponse, portfolioResponse] = await Promise.all([
        api.get('/investor/profile'),
        api.get('/transactions/history'),
        api.get('/transactions/portfolio'),
      ]);

      return {
        profile: profileResponse.data,
        transactions: historyResponse.data,
        holdings: portfolioResponse.data,
      };
    },
    options
  );
}

export function getCachedAdvisorHubBundle() {
  return readSessionCache(sessionCacheKeys.advisorHubBundle, {
    ttlMs: SESSION_CACHE_TTLS.advisorHubBundle,
  });
}

export async function fetchAdvisorHubBundle(options = {}) {
  return loadSessionResource(
    sessionCacheKeys.advisorHubBundle,
    SESSION_CACHE_TTLS.advisorHubBundle,
    async () => {
      const existingBundle = readSessionCache(sessionCacheKeys.advisorHubBundle, {
        ttlMs: SESSION_CACHE_TTLS.advisorHubBundle,
      });
      const [advisorsResponse, appointmentsResponse] = await Promise.allSettled([
        api.get('/advisors'),
        api.get('/advisors/appointments'),
      ]);

      if (advisorsResponse.status === 'rejected' && appointmentsResponse.status === 'rejected') {
        throw advisorsResponse.reason || appointmentsResponse.reason;
      }

      return {
        advisors: advisorsResponse.status === 'fulfilled'
          ? advisorsResponse.value.data
          : (existingBundle?.advisors || []),
        appointments: appointmentsResponse.status === 'fulfilled'
          ? appointmentsResponse.value.data
          : (existingBundle?.appointments || []),
      };
    },
    options
  );
}

export function getCachedAdvisorDetailBundle(advisorId) {
  return readSessionCache(sessionCacheKeys.advisorDetail(advisorId), {
    ttlMs: SESSION_CACHE_TTLS.advisorDetail,
  });
}

export async function fetchAdvisorDetailBundle(advisorId, options = {}) {
  return loadSessionResource(
    sessionCacheKeys.advisorDetail(advisorId),
    SESSION_CACHE_TTLS.advisorDetail,
    async () => {
      const [advisorResponse, profileResponse] = await Promise.all([
        api.get(`/advisors/${advisorId}`),
        api.get('/investor/profile'),
      ]);

      return {
        advisor: advisorResponse.data,
        profile: profileResponse.data,
      };
    },
    options
  );
}

export function getCachedAdvisorAvailability(advisorId) {
  return readSessionCache(sessionCacheKeys.advisorAvailability(advisorId), {
    ttlMs: SESSION_CACHE_TTLS.advisorAvailability,
  });
}

export async function fetchAdvisorAvailability(advisorId, options = {}) {
  return loadSessionResource(
    sessionCacheKeys.advisorAvailability(advisorId),
    SESSION_CACHE_TTLS.advisorAvailability,
    async () => {
      const response = await api.get(`/advisors/${advisorId}/availability`);
      return response.data;
    },
    options
  );
}

export function getCachedAdvisorWorkspaceBundle() {
  return readSessionCache(sessionCacheKeys.advisorWorkspaceBundle, {
    ttlMs: SESSION_CACHE_TTLS.advisorWorkspaceBundle,
  });
}

export async function fetchAdvisorWorkspaceBundle(options = {}) {
  return loadSessionResource(
    sessionCacheKeys.advisorWorkspaceBundle,
    SESSION_CACHE_TTLS.advisorWorkspaceBundle,
    async () => {
      const existingBundle = readSessionCache(sessionCacheKeys.advisorWorkspaceBundle, {
        ttlMs: SESSION_CACHE_TTLS.advisorWorkspaceBundle,
      });
      const [appointmentsResponse, availabilityResponse] = await Promise.allSettled([
        api.get('/advisors/advisor-appointments'),
        api.get('/advisors/advisor-availability'),
      ]);

      if (appointmentsResponse.status === 'rejected' && availabilityResponse.status === 'rejected') {
        throw appointmentsResponse.reason || availabilityResponse.reason;
      }

      return {
        appointments: appointmentsResponse.status === 'fulfilled'
          ? appointmentsResponse.value.data
          : (existingBundle?.appointments || []),
        availabilitySlots: availabilityResponse.status === 'fulfilled'
          ? availabilityResponse.value.data
          : (existingBundle?.availabilitySlots || []),
      };
    },
    options
  );
}

export function getCachedAdminBundle() {
  return readSessionCache(sessionCacheKeys.adminBundle, {
    ttlMs: SESSION_CACHE_TTLS.adminBundle,
  });
}

export async function fetchAdminBundle(options = {}) {
  return loadSessionResource(
    sessionCacheKeys.adminBundle,
    SESSION_CACHE_TTLS.adminBundle,
    async () => {
      const existingBundle = readSessionCache(sessionCacheKeys.adminBundle, {
        ttlMs: SESSION_CACHE_TTLS.adminBundle,
      });
      const [usersResponse, statsResponse, auditResponse] = await Promise.allSettled([
        api.get('/admin/users'),
        api.get('/admin/stats'),
        api.get('/admin/audit-logs'),
      ]);

      const bundle = {
        users: usersResponse.status === 'fulfilled' ? usersResponse.value.data : (existingBundle?.users || []),
        stats: statsResponse.status === 'fulfilled' ? statsResponse.value.data : (existingBundle?.stats || null),
        auditLogs:
          auditResponse.status === 'fulfilled' ? auditResponse.value.data : (existingBundle?.auditLogs || []),
      };

      if (bundle.stats) {
        writeSessionCache(sessionCacheKeys.adminStats, bundle.stats);
      }

      return bundle;
    },
    options
  );
}

export function prefetchRouteSessionData(pathname, role) {
  if (!pathname) return Promise.resolve();

  if (pathname === '/funds') {
    return fetchPublicFunds().catch(swallowPrefetchError);
  }

  if (role === 'INVESTOR') {
    if (pathname === '/portfolio') {
      return fetchInvestorBundle().catch(swallowPrefetchError);
    }

    if (pathname === '/advisors') {
      return fetchAdvisorHubBundle().catch(swallowPrefetchError);
    }

    if (pathname.startsWith('/advisors/')) {
      const advisorId = pathname.split('/')[2];
      if (advisorId) {
        return fetchAdvisorDetailBundle(advisorId).catch(swallowPrefetchError);
      }
    }
  }

  if (role === 'ADVISOR' && pathname === '/appointments') {
    return fetchAdvisorWorkspaceBundle().catch(swallowPrefetchError);
  }

  if (role === 'ADMIN' && pathname === '/admin') {
    return fetchAdminBundle().catch(swallowPrefetchError);
  }

  return Promise.resolve();
}

export function prefetchRoleSessionData(role) {
  const tasks = [fetchPublicFunds().catch(swallowPrefetchError)];

  if (role === 'INVESTOR') {
    tasks.push(fetchInvestorBundle().catch(swallowPrefetchError));
    tasks.push(fetchAdvisorHubBundle().catch(swallowPrefetchError));
  }

  if (role === 'ADVISOR') {
    tasks.push(fetchAdvisorWorkspaceBundle().catch(swallowPrefetchError));
  }

  if (role === 'ADMIN') {
    tasks.push(fetchAdminBundle().catch(swallowPrefetchError));
  }

  return Promise.all(tasks);
}

export function scheduleRoleSessionPrefetch(role) {
  if (typeof window === 'undefined' || !role) return;

  const runPrefetch = () => {
    prefetchRoleSessionData(role).catch(swallowPrefetchError);
  };

  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(runPrefetch, { timeout: 1200 });
    return;
  }

  window.setTimeout(runPrefetch, 150);
}
