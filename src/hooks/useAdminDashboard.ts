import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "../api/products.api";
import { ordersApi } from "../api/orders.api";
import { axiosInstance } from "../api/axios.instance";
import type { ApiResponse } from "../types/api.types";
import type { Order } from "../types/order.types";
import type { User } from "../types/auth.types";

interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
}

interface RevenuePoint {
  day: string;
  amount: number;
}

interface StatusPoint {
  name: string;
  value: number;
}

const extractArray = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (
    value &&
    typeof value === "object" &&
    Array.isArray((value as { data?: unknown }).data)
  ) {
    return (value as { data: T[] }).data;
  }

  return [];
};

const toDateKey = (value: unknown): string | null => {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
};

const STATUS_ORDER = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

const toOrderTotal = (order: Order): number => {
  return order.totalAmount ?? order.total ?? 0;
};

export const useAdminDashboard = () => {
  const ordersQuery = useQuery({
    queryKey: ["dashboard-orders"],
    queryFn: () => ordersApi.adminAll({}),
  });

  const productsQuery = useQuery({
    queryKey: ["dashboard-products"],
    queryFn: () => productsApi.adminList({ page: 1, limit: 500 }),
  });

  const customersQuery = useQuery({
    queryKey: ["dashboard-customers"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiResponse<User[]>>("/users");
      return extractArray<User>(data.data as unknown);
    },
  });

  const metrics = useMemo<DashboardMetrics>(() => {
    const orders = ordersQuery.data ?? [];
    const paidRevenue = orders
      .filter((order) => order.paymentStatus === "PAID")
      .reduce((sum, order) => sum + toOrderTotal(order), 0);

    return {
      totalRevenue: paidRevenue,
      totalOrders: orders.length,
      totalProducts:
        productsQuery.data?.meta.total ?? productsQuery.data?.data.length ?? 0,
      totalCustomers: customersQuery.data?.length ?? 0,
    };
  }, [ordersQuery.data, productsQuery.data, customersQuery.data]);

  const revenueSeries = useMemo<RevenuePoint[]>(() => {
    const orders = ordersQuery.data ?? [];
    const now = new Date();
    const buckets = new Map<string, number>();

    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      buckets.set(key, 0);
    }

    orders.forEach((order) => {
      if (order.paymentStatus !== "PAID") return;
      const key = toDateKey(order.createdAt);
      if (!key) return;
      if (!buckets.has(key)) return;
      buckets.set(key, (buckets.get(key) ?? 0) + toOrderTotal(order));
    });

    return Array.from(buckets.entries()).map(([date, amount]) => ({
      day: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
      amount,
    }));
  }, [ordersQuery.data]);

  const statusSeries = useMemo<StatusPoint[]>(() => {
    const orders = ordersQuery.data ?? [];
    return STATUS_ORDER.map((status) => ({
      name: status,
      value: orders.filter((order) => order.status === status).length,
    }));
  }, [ordersQuery.data]);

  const recentOrders = useMemo(() => {
    const orders = ordersQuery.data ?? [];
    return [...orders]
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 5);
  }, [ordersQuery.data]);

  const lowStockProducts = useMemo(() => {
    const products = productsQuery.data?.data ?? [];
    return products.filter((product) => product.stock <= 10).slice(0, 8);
  }, [productsQuery.data]);

  return {
    isLoading:
      ordersQuery.isLoading ||
      productsQuery.isLoading ||
      customersQuery.isLoading,
    isError:
      ordersQuery.isError || productsQuery.isError || customersQuery.isError,
    metrics,
    revenueSeries,
    statusSeries,
    recentOrders,
    lowStockProducts,
  };
};
