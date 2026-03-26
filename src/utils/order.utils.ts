import type { Order } from "../types/order.types";

type LooseOrder = Order & {
  user?: {
    firstName?: string;
    lastName?: string;
    name?: string;
    fullName?: string;
    email?: string;
  };
  customer?: {
    firstName?: string;
    lastName?: string;
    name?: string;
    fullName?: string;
    email?: string;
  };
};

const asNonEmpty = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const composeName = (firstName?: string, lastName?: string): string | null => {
  const first = asNonEmpty(firstName);
  const last = asNonEmpty(lastName);

  if (first && last) {
    return `${first} ${last}`;
  }

  return first ?? last ?? null;
};

export const getOrderCustomerName = (order: LooseOrder): string => {
  const customerFullName =
    asNonEmpty(order.customer?.fullName) ??
    asNonEmpty(order.customer?.name) ??
    composeName(order.customer?.firstName, order.customer?.lastName);

  if (customerFullName) {
    return customerFullName;
  }

  const userFullName =
    asNonEmpty(order.user?.fullName) ??
    asNonEmpty(order.user?.name) ??
    composeName(order.user?.firstName, order.user?.lastName);

  if (userFullName) {
    return userFullName;
  }

  const shippingName = composeName(
    order.shippingAddress?.firstName,
    order.shippingAddress?.lastName,
  );

  if (shippingName) {
    return shippingName;
  }

  return (
    asNonEmpty(order.customer?.email) ??
    asNonEmpty(order.user?.email) ??
    "Unknown customer"
  );
};
