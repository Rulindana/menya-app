const normalizeVersion = (version: string): number[] =>
  version
    .replace(/^v/i, '')
    .split('-')[0]
    .split('.')
    .map((part) => {
      const parsed = parseInt(part.replace(/\D/g, ''), 10);
      return Number.isFinite(parsed) ? parsed : 0;
    });

export const compareVersions = (latest: string, current: string): number => {
  const latestParts = normalizeVersion(latest);
  const currentParts = normalizeVersion(current);
  const length = Math.max(latestParts.length, currentParts.length);

  for (let index = 0; index < length; index += 1) {
    const latestPart = latestParts[index] ?? 0;
    const currentPart = currentParts[index] ?? 0;
    if (latestPart > currentPart) return 1;
    if (latestPart < currentPart) return -1;
  }
  return 0;
};
