export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );

  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value || 0);
}

export function formatTimestamp(value?: string) {
  if (!value) {
    return "Just now";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export async function copyText(value: string) {
  await navigator.clipboard.writeText(value);
}

export function uid(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function mergeStreamingText(previous: string, incoming: string) {
  if (!incoming) {
    return previous;
  }

  if (!previous) {
    return incoming;
  }

  if (incoming.startsWith(previous)) {
    return incoming;
  }

  if (previous.endsWith(incoming)) {
    return previous;
  }

  return previous + incoming;
}
