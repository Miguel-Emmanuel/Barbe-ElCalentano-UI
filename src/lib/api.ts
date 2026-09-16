const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "el_calentano_staff_token";

export type Service = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  durationMin: number;
  priceCents: number;
  priceMxn: number;
  category: string;
  allowsQuantity: boolean;
  active?: boolean;
};

export type Barber = {
  id: string;
  name: string;
  slug: string;
  nickname: string | null;
  specialties: string | null;
};

export type Branch = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  instagram: string | null;
  businessHours: Array<{
    dayOfWeek: number;
    openMin: number;
    closeMin: number;
    closed: boolean;
    byAppointmentOnly: boolean;
  }>;
};

export type AppointmentRow = {
  id: string;
  startAt: string;
  endAt: string;
  status: string;
  priceCents: number;
  quantity: number;
  notes?: string | null;
  client: { name: string; phone: string };
  barber: { name: string; nickname: string | null };
  service: { name: string };
  payment: { status: string; tipCents: number } | null;
};

export type WaitlistRow = {
  id: string;
  date: string;
  preferredTime: string | null;
  status: string;
  client: { name: string; phone: string };
  service: { name: string };
  barber: { name: string; nickname: string | null } | null;
};

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init?: RequestInit & { auth?: boolean }): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (init?.auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const json = await res.json();
  if (!res.ok || json.ok === false) {
    const err = new Error(json.message ?? "Error inesperado") as Error & {
      code?: string;
      details?: unknown;
      status?: number;
    };
    err.code = json.code;
    err.details = json.details;
    err.status = res.status;
    throw err;
  }
  return json as T;
}

export const api = {
  getServices: () =>
    request<{ ok: true; currency: string; data: Service[] }>("/api/services"),
  getBarbers: () => request<{ ok: true; data: Barber[] }>("/api/barbers"),
  getBranch: () => request<{ ok: true; data: Branch }>("/api/branch"),
  getAvailability: (q: {
    date: string;
    serviceId: string;
    barberId: string;
    quantity?: number;
  }) => {
    const params = new URLSearchParams({
      date: q.date,
      serviceId: q.serviceId,
      barberId: q.barberId,
    });
    if (q.quantity) params.set("quantity", String(q.quantity));
    return request<{
      ok: true;
      data: {
        slots: string[];
        note?: string;
        byAppointmentOnly: boolean;
        durationMin: number;
        slotStepMin?: number;
        bufferMin?: number;
      };
    }>(`/api/availability?${params.toString()}`);
  },
  createAppointment: (body: {
    serviceId: string;
    barberId: string;
    startAt: string;
    clientName: string;
    clientPhone: string;
    clientEmail?: string;
    quantity?: number;
    notes?: string;
  }) =>
    request<{ ok: true; data: Record<string, unknown>; message?: string }>("/api/appointments", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  joinWaitlist: (body: {
    date: string;
    serviceId: string;
    barberId?: string;
    clientName: string;
    clientPhone: string;
    preferredTime?: string;
    notes?: string;
  }) =>
    request<{ ok: true; message?: string }>("/api/waitlist", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  login: (email: string, password: string) =>
    request<{
      ok: true;
      data: { token: string; user: { id: string; name: string; email: string; role: string } };
    }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () => request<{ ok: true }>("/api/auth/logout", { method: "POST", auth: true }),
  me: () =>
    request<{ ok: true; data: { id: string; name: string; email: string; role: string } }>(
      "/api/auth/me",
      { auth: true },
    ),
  getAppointments: (date?: string) => {
    const q = date ? `?date=${date}` : "";
    return request<{ ok: true; data: AppointmentRow[] }>(`/api/appointments${q}`, { auth: true });
  },
  updateStatus: (id: string, status: string) =>
    request<{ ok: true; data: AppointmentRow }>(`/api/appointments/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
      auth: true,
    }),
  markPaid: (id: string, tipCents = 0) =>
    request<{ ok: true; data: unknown }>(`/api/appointments/${id}/pay`, {
      method: "POST",
      body: JSON.stringify({ method: "CASH", tipCents }),
      auth: true,
    }),
  cancelAppointment: (id: string) =>
    request<{ ok: true; data: { cancellation?: { message: string; feeMxn: number } } }>(
      `/api/appointments/${id}/cancel`,
      { method: "POST", auth: true },
    ),
  reschedule: (id: string, startAt: string) =>
    request<{ ok: true; data: AppointmentRow }>(`/api/appointments/${id}/reschedule`, {
      method: "POST",
      body: JSON.stringify({ startAt }),
      auth: true,
    }),
  getStats: (date: string) =>
    request<{
      ok: true;
      data: {
        totals: {
          appointments: number;
          completed: number;
          cancelled: number;
          noShow: number;
          revenueMxn: number;
          tipsMxn: number;
          barberEarnMxn?: number;
          shopEarnMxn?: number;
          occupancyHint?: string;
        };
      };
    }>(`/api/admin/stats?date=${date}`, { auth: true }),
  getAdminServices: () =>
    request<{ ok: true; data: Service[] }>("/api/admin/services", { auth: true }),
  saveService: (body: Record<string, unknown>) =>
    request<{ ok: true; data: Service }>("/api/admin/services", {
      method: "POST",
      body: JSON.stringify(body),
      auth: true,
    }),
  setServiceActive: (id: string, active: boolean) =>
    request<{ ok: true }>(`/api/admin/services/${id}/active`, {
      method: "PATCH",
      body: JSON.stringify({ active }),
      auth: true,
    }),
  getWaitlist: (date?: string) => {
    const q = date ? `?date=${date}` : "";
    return request<{ ok: true; data: WaitlistRow[] }>(`/api/admin/waitlist${q}`, { auth: true });
  },
  updateWaitlist: (id: string, status: string) =>
    request<{ ok: true }>(`/api/admin/waitlist/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
      auth: true,
    }),
  getProducts: () =>
    request<{
      ok: true;
      data: Array<{
        id: string;
        sku: string;
        name: string;
        priceCents: number;
        stock: number;
        active: boolean;
      }>;
    }>("/api/admin/products", { auth: true }),
  saveProduct: (body: Record<string, unknown>) =>
    request<{ ok: true }>("/api/admin/products", {
      method: "POST",
      body: JSON.stringify(body),
      auth: true,
    }),
  sellProducts: (items: Array<{ productId: string; quantity: number }>, clientPhone?: string) =>
    request<{ ok: true; data: { totalCents: number; message?: string } }>("/api/admin/sales", {
      method: "POST",
      body: JSON.stringify({ items, clientPhone, method: "CASH" }),
      auth: true,
    }),
  getCommissions: (date?: string) => {
    const q = date ? `?date=${date}` : "";
    return request<{
      ok: true;
      data: Array<{
        id: string;
        barberEarnCents: number;
        shopEarnCents: number;
        tipCents: number;
        commissionPercent: number;
        appointment: {
          barber: { name: string };
          service: { name: string };
          client: { name: string };
        };
      }>;
      totals: {
        count: number;
        barberEarnCents: number;
        shopEarnCents: number;
        tipCents: number;
        byBarber: Array<{
          barberId: string;
          barberName: string;
          count: number;
          barberEarnCents: number;
          shopEarnCents: number;
          tipCents: number;
        }>;
      };
    }>(`/api/admin/commissions${q}`, { auth: true });
  },
  getAdminBarbers: () =>
    request<{
      ok: true;
      data: Array<{
        id: string;
        name: string;
        nickname: string | null;
        commissionPercent: number;
        active: boolean;
      }>;
    }>("/api/admin/barbers", { auth: true }),
  updateBarberCommission: (id: string, commissionPercent: number) =>
    request<{ ok: true; data: { id: string; commissionPercent: number } }>(
      `/api/admin/barbers/${id}/commission`,
      {
        method: "PATCH",
        body: JSON.stringify({ commissionPercent }),
        auth: true,
      },
    ),
  processReminders: () =>
    request<{ ok: true; message?: string }>("/api/admin/reminders/process", {
      method: "POST",
      auth: true,
    }),
  getLoyalty: (phone: string) =>
    request<{ ok: true; data: { name: string; loyaltyPoints: number } }>(`/api/loyalty/${phone}`),
};

export function formatMxn(cents: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: "America/Mexico_City",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatSlotRange(startIso: string, durationMin: number) {
  const start = new Date(startIso);
  const end = new Date(start.getTime() + durationMin * 60_000);
  return `${formatTime(start.toISOString())}–${formatTime(end.toISOString())}`;
}

export type StaffStatus = "SCHEDULED" | "CONFIRMED" | "CHECKED_IN" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

export function staffActionsFor(status: string) {
  const s = status as StaffStatus;
  const terminal = s === "COMPLETED" || s === "CANCELLED" || s === "NO_SHOW";
  return {
    canCheckIn: s === "SCHEDULED" || s === "CONFIRMED",
    canCharge: s === "CHECKED_IN",
    canCancel: !terminal,
    canNoShow: s === "SCHEDULED" || s === "CONFIRMED" || s === "CHECKED_IN",
    readOnly: terminal,
  };
}
