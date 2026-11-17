type AttemptRecord = {
  failures: number;
  windowStartedAt: number;
  blockedUntil: number;
};

const WINDOW_MS = 15 * 60 * 1000;
const BLOCK_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const attempts = new Map<string, AttemptRecord>();

function now() {
  return Date.now();
}

export function getLoginKey(username: string, request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const address = forwardedFor?.split(",")[0]?.trim() || "unknown-client";
  return `${address}:${username.trim().toLowerCase()}`;
}

export function isLoginBlocked(key: string) {
  const record = attempts.get(key);
  if (!record) return false;

  if (record.blockedUntil > now()) return true;
  if (record.blockedUntil || now() - record.windowStartedAt >= WINDOW_MS) {
    attempts.delete(key);
  }

  return false;
}

export function recordLoginFailure(key: string) {
  const timestamp = now();
  const current = attempts.get(key);
  const record = current && timestamp - current.windowStartedAt < WINDOW_MS
    ? current
    : { failures: 0, windowStartedAt: timestamp, blockedUntil: 0 };

  record.failures += 1;
  if (record.failures >= MAX_FAILURES) {
    record.blockedUntil = timestamp + BLOCK_MS;
  }
  attempts.set(key, record);
}

export function clearLoginFailures(key: string) {
  attempts.delete(key);
}
