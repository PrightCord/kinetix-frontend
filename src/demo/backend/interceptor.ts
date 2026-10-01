import { handleMockRequest } from './router.ts';

let installed = false;
let originalFetch: typeof globalThis.fetch | null = null;

function safeDefineFetch(target: any, fn: typeof globalThis.fetch): boolean {
  if (!target) return false;
  try {
    Object.defineProperty(target, 'fetch', {
      value: fn,
      writable: true,
      configurable: true,
      enumerable: true,
    });
    return true;
  } catch {
    try {
      target.fetch = fn;
      return true;
    } catch {
      return false;
    }
  }
}

export function installFetchInterceptor() {
  if (installed) return;

  const globalScope: any =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof window !== 'undefined'
      ? window
      : null;

  if (!globalScope || typeof globalScope.fetch !== 'function') return;

  // Bind originalFetch to global scope to prevent "Illegal invocation" errors
  const rawFetch = globalScope.fetch;
  originalFetch = rawFetch.bind(globalScope);

  const patchedFetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

    // Check if this is an admin API, healthz, or mock proxy route
    if (
      url.includes('/admin/api/') ||
      url.includes('/healthz') ||
      url.includes('/v1/chat/completions') ||
      url.includes('/v1/messages') ||
      url.startsWith('/admin/api/') ||
      url.startsWith('/healthz') ||
      url.startsWith('/v1/')
    ) {
      try {
        const mockRes = await handleMockRequest(url, init);
        if (mockRes) return mockRes;
      } catch (err) {
        console.error('[DemoInterceptor] Mock handler error:', err);
      }
    }

    if (originalFetch) {
      return originalFetch(input, init);
    }
    return rawFetch.call(globalScope, input, init);
  };

  // Safely define on globalScope, window, and Window.prototype
  safeDefineFetch(globalScope, patchedFetch as any);

  if (typeof window !== 'undefined') {
    if ((window as any) !== globalScope) {
      safeDefineFetch(window, patchedFetch as any);
    }
    const winProto = Object.getPrototypeOf(window);
    if (winProto && 'fetch' in winProto) {
      safeDefineFetch(winProto, patchedFetch as any);
    }
  }

  installed = true;
}

export function uninstallFetchInterceptor() {
  if (!installed || !originalFetch) return;

  const globalScope: any =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof window !== 'undefined'
      ? window
      : null;

  if (globalScope) {
    safeDefineFetch(globalScope, originalFetch);
  }

  if (typeof window !== 'undefined') {
    if ((window as any) !== globalScope) {
      safeDefineFetch(window, originalFetch);
    }
    const winProto = Object.getPrototypeOf(window);
    if (winProto && 'fetch' in winProto) {
      safeDefineFetch(winProto, originalFetch);
    }
  }

  installed = false;
}

