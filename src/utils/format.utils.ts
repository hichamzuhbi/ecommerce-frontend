/**
 * Converts a raw UUID (or any id) into a short, professional order reference.
 * e.g. "c10fe08e-2d36-4cba-86a3-3331c25b8ef4"  →  "ORD-C10F-E08E"
 */
export const formatOrderRef = (id: string): string => {
  const clean = id.replace(/-/g, "").toUpperCase();
  const a = clean.slice(0, 4);
  const b = clean.slice(4, 8);
  return `ORD-${a}-${b}`;
};

export const formatPrice = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatDate = (value: string): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
};
