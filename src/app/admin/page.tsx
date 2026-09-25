"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { BrandTitle } from "@/components/BrandTitle";
import { useConfirmDialog } from "@/components/ConfirmModal";
import { DetailModal } from "@/components/DetailModal";
import { BarberPick } from "@/components/BarberPick";
import {
  api,
  formatMxn,
  formatTime,
  getToken,
  setToken,
  staffActionsFor,
  type AppointmentRow,
  type CommissionRow,
  type CommissionTotals,
  type Service,
  type StaffUser,
  type WaitlistRow,
} from "@/lib/api";

const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: "Programada",
  CONFIRMED: "Confirmada",
  CHECKED_IN: "Check-in",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  NO_SHOW: "No llegó",
};

type Tab = "agenda" | "catalogo" | "espera" | "stats" | "tienda" | "comisiones" | "historial";

function tipCentsFromInput(raw: string | undefined) {
  const tipMxn = Number(raw ?? "0");
  if (!Number.isFinite(tipMxn) || tipMxn < 0) return 0;
  return Math.round(tipMxn * 100);
}

function phoneLabel(phone: string | null | undefined) {
  if (!phone) return "Sin WhatsApp";
  return phone.startsWith("L") ? "Sin WhatsApp" : phone;
}

function todayMx() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function formatDayLabel(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}

function previewSplit(serviceCents: number, pct: number, tipCents = 0) {
  const safePct = Math.min(100, Math.max(0, pct));
  const barberService = Math.round((serviceCents * safePct) / 100);
  return {
    barberService,
    shop: serviceCents - barberService,
    tip: tipCents,
    barberTotal: barberService + tipCents,
  };
}

type Product = {
  id: string;
  sku: string;
  name: string;
  priceCents: number;
  stock: number;
  active: boolean;
};

export default function AdminPage() {
  const [tokenReady, setTokenReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [userName, setUserName] = useState("");
  const [staff, setStaff] = useState<StaffUser | null>(null);
  const isSuperAdmin = staff?.isSuperAdmin ?? false;
  const [email, setEmail] = useState("admin@elcalentano.mx");
  const [password, setPassword] = useState("calentano123");
  const [tab, setTab] = useState<Tab>("agenda");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<AppointmentRow[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistRow[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [commissions, setCommissions] = useState<CommissionRow[]>([]);
  const [commissionTotals, setCommissionTotals] = useState<CommissionTotals | null>(null);
  const [commFrom, setCommFrom] = useState(todayMx);
  const [commTo, setCommTo] = useState(todayMx);
  const [detailBarberId, setDetailBarberId] = useState<string | null>(null);
  const [detailCommissionId, setDetailCommissionId] = useState<string | null>(null);
  const [adminBarbers, setAdminBarbers] = useState<
    Array<{
      id: string;
      name: string;
      nickname: string | null;
      commissionPercent: number;
      active: boolean;
    }>
  >([]);
  const [barberPctDraft, setBarberPctDraft] = useState<Record<string, string>>({});
  const [stats, setStats] = useState<{
    appointments: number;
    completed: number;
    cancelled: number;
    noShow: number;
    revenueMxn: number;
    tipsMxn: number;
    barberEarnMxn?: number;
    shopEarnMxn?: number;
    occupancyHint?: string;
  } | null>(null);
  const [tipById, setTipById] = useState<Record<string, string>>({});
  const [sellQty, setSellQty] = useState<Record<string, number>>({});
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { ask, alert: showAlert, Dialog: ConfirmDialog } = useConfirmDialog();
  const [historyRows, setHistoryRows] = useState<AppointmentRow[]>([]);
  const [walkOpen, setWalkOpen] = useState(false);
  const [walkServiceId, setWalkServiceId] = useState("");
  const [walkBarberId, setWalkBarberId] = useState("");
  const [walkName, setWalkName] = useState("");
  const [walkPhone, setWalkPhone] = useState("");
  const [walkCatalog, setWalkCatalog] = useState<Service[]>([]);
  const [histFilters, setHistFilters] = useState({
    dateFrom: "",
    dateTo: "",
    q: "",
    serviceId: "",
    barberId: "",
    status: "",
    minPrice: "",
    maxPrice: "",
    hasCommission: "" as "" | "yes" | "no",
  });
  const [histBarbers, setHistBarbers] = useState<
    Array<{ id: string; name: string; slug: string; nickname: string | null }>
  >([]);
  const [histServices, setHistServices] = useState<Service[]>([]);
  const EXAMPLE_SERVICE_CENTS = 12000;

  useEffect(() => {
    const token = getToken();
    setTokenReady(true);
    if (!token) return;
    api
      .me()
      .then((res) => {
        setAuthed(true);
        setUserName(res.data.name);
        setStaff(res.data);
      })
      .catch(() => {
        setToken(null);
        setAuthed(false);
      });
  }, []);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.login(email, password);
      setToken(res.data.token);
      setUserName(res.data.user.name);
      setStaff(res.data.user);
      setAuthed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  async function onLogout() {
    try {
      await api.logout();
    } catch {
      /* ignore */
    }
    setToken(null);
    setAuthed(false);
    setStaff(null);
  }

  async function refresh() {
    setLoading(true);
    setError("");
    setInfo("");
    try {
      if (tab === "agenda") setRows((await api.getAppointments(date)).data);
      if (tab === "catalogo") setServices((await api.getAdminServices()).data);
      if (tab === "espera") setWaitlist((await api.getWaitlist(date)).data);
      if (tab === "stats") setStats((await api.getStats(date)).data.totals);
      if (tab === "tienda") setProducts((await api.getProducts()).data);
      if (tab === "historial") {
        const [hist, barbers, services] = await Promise.all([
          api.searchAppointments(histFilters),
          api.getAdminBarbers(),
          api.getAdminServices(),
        ]);
        setHistoryRows(hist.data);
        setHistBarbers(barbers.data);
        setHistServices(services.data);
      }
      if (tab === "comisiones") {
        const [commRes, barberRes] = await Promise.all([
          api.getCommissions({ dateFrom: commFrom, dateTo: commTo }),
          api.getAdminBarbers(),
        ]);
        setCommissions(commRes.data);
        setCommissionTotals(commRes.totals);
        setAdminBarbers(barberRes.data);
        setBarberPctDraft(
          Object.fromEntries(
            barberRes.data.map((b) => [b.id, String(b.commissionPercent)]),
          ),
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authed) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, tab, date, commFrom, commTo]);

  useEffect(() => {
    if (!authed || tab !== "historial") return;
    const timer = window.setTimeout(() => {
      void refresh();
    }, 280);
    return () => window.clearTimeout(timer);
    // La búsqueda libre se aplica al escribir. Los demás filtros usan «Aplicar».
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [histFilters.q, authed, tab]);

  useEffect(() => {
    if (!staff || staff.isSuperAdmin) return;
    if (tab === "espera" || tab === "tienda" || tab === "stats") setTab("agenda");
  }, [staff, tab]);

  const allTabs: Array<[Tab, string]> = [
    ["agenda", "Agenda"],
    ["historial", "Historial"],
    ["catalogo", "Servicios"],
    ["espera", "Espera"],
    ["tienda", "Tienda"],
    ["comisiones", "Comisiones"],
    ["stats", "Métricas"],
  ];
  const tabs: Array<[Tab, string]> = isSuperAdmin
    ? allTabs
    : [
        ["agenda", "Mis cortes"],
        ["historial", "Mi historial"],
        ["comisiones", "Mi corte del día"],
        ["catalogo", "Precios"],
      ];

  if (!tokenReady) {
    return (
      <main className="min-h-screen bg-brick-wall bg-cover bg-center p-8 text-bone/60">
        Cargando…
      </main>
    );
  }

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-brick-wall bg-cover bg-center px-4 text-bone">
        <form onSubmit={onLogin} className="panel w-full max-w-md p-6">
          <p className="text-xs tracking-[0.25em] text-gold">STAFF</p>
          <BrandTitle as="h1" className="mt-2 text-3xl text-bone">
            El Calentano
          </BrandTitle>
          <p className="mt-1 text-sm text-bone/60">Panel de operaciones</p>
          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-brick/50 bg-brick/20 px-3 py-2 text-sm"
            >
              {error}
            </p>
          )}
          <input
            className="mt-5 w-full rounded-lg border border-white/20 bg-ink px-4 py-3"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo"
          />
          <input
            className="mt-3 w-full rounded-lg border border-white/20 bg-ink px-4 py-3"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-full bg-bone py-3 text-sm font-semibold text-ink disabled:opacity-50"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
          <Link href="/" className="mt-4 block text-center text-sm text-bone/50 hover:text-gold">
            Volver al sitio
          </Link>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brick-wall bg-cover bg-center text-bone">
      {ConfirmDialog}
      <header className="safe-pt sticky top-0 z-40 border-b border-white/10 bg-ink/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 safe-px py-3">
          <div className="min-w-0">
            <p className="text-[10px] tracking-[0.25em] text-gold sm:text-xs">STAFF</p>
            <h1 className="truncate text-lg font-semibold sm:text-xl">Hola, {userName}</h1>
          </div>
          <div className="chip-scroll text-sm">
            <button
              type="button"
              className="shrink-0 py-2 text-bone/70 hover:text-gold"
              onClick={async () => {
                try {
                  const res = await api.processReminders();
                  await showAlert({
                    title: "Recordatorios",
                    message: res.message ?? "Recordatorios procesados",
                  });
                } catch (err) {
                  await showAlert({
                    title: "Error",
                    message: err instanceof Error ? err.message : "Error en recordatorios",
                    tone: "danger",
                  });
                }
              }}
            >
              Recordatorios
            </button>
            <Link href="/" className="shrink-0 py-2 text-bone/70 hover:text-gold">
              Sitio
            </Link>
            <button
              type="button"
              onClick={async () => {
                const ok = await ask({
                  title: "Cerrar sesión",
                  message: "¿Salir del panel de staff?",
                  confirmLabel: "Salir",
                  cancelLabel: "Quedarme",
                  tone: "neutral",
                });
                if (!ok) return;
                await onLogout();
              }}
              className="shrink-0 py-2 text-bone/70 hover:text-gold"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl safe-px py-4 sm:py-6">
        <div className="chip-scroll -mx-1 px-1">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`shrink-0 rounded-full px-4 py-2.5 text-sm ${
                tab === id ? "bg-bone font-semibold text-ink" : "border border-white/15"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:mt-5 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
          {tab !== "historial" && tab !== "catalogo" && tab !== "tienda" && tab !== "comisiones" ? (
            <label className="w-full text-sm sm:w-auto">
              Fecha
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field mt-1 sm:w-auto"
              />
            </label>
          ) : null}
          <button
            type="button"
            onClick={refresh}
            className="btn-ghost w-full border-gold/40 text-gold-soft sm:w-auto"
          >
            Actualizar
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-lg border border-brick/50 bg-brick/20 px-4 py-3 text-sm">
            {error}
          </p>
        )}
        {info && (
          <p className="mt-4 rounded-lg border border-gold/40 bg-bone/10 px-4 py-3 text-sm text-gold-soft">
            {info}
          </p>
        )}
        {loading && <p className="mt-4 text-sm text-bone/60">Cargando…</p>}

        {tab === "agenda" && (
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-gold/25 bg-ink/50 p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-gold">Corte en local</p>
                  <p className="mt-1 text-xs text-bone/55">
                    Para quien llega sin cita. Ocupa el horario del barbero desde ahora, o desde el
                    siguiente hueco libre, y entra al corte del día.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-gold !min-h-11 !rounded-xl"
                  onClick={async () => {
                    setWalkOpen((open) => !open);
                    if (walkCatalog.length === 0) {
                      const services = await api.getServices();
                      setWalkCatalog(services.data);
                      if (!walkServiceId && services.data[0]) setWalkServiceId(services.data[0].id);
                    }
                    if (isSuperAdmin) {
                      let list = histBarbers;
                      if (list.length === 0) {
                        const barbers = await api.getAdminBarbers();
                        setHistBarbers(barbers.data);
                        list = barbers.data;
                      }
                      if (!walkBarberId && list[0]) setWalkBarberId(list[0].id);
                    }
                  }}
                >
                  {walkOpen ? "Cerrar" : "Registrar corte"}
                </button>
              </div>
              {walkOpen ? (
                <form
                  className="mt-3 grid gap-2 sm:grid-cols-2"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!walkServiceId || walkName.trim().length < 2) {
                      await showAlert({
                        title: "Faltan datos",
                        message: "Elige el servicio y escribe el nombre del cliente.",
                        tone: "danger",
                      });
                      return;
                    }
                    if (walkPhone && walkPhone.length !== 10) {
                      await showAlert({
                        title: "WhatsApp",
                        message: "Si pones WhatsApp, deben ser 10 dígitos. Si no lo tienes, déjalo vacío.",
                        tone: "danger",
                      });
                      return;
                    }
                    try {
                      const res = await api.createWalkIn({
                        serviceId: walkServiceId,
                        barberId: isSuperAdmin ? walkBarberId : undefined,
                        clientName: walkName.trim(),
                        clientPhone: walkPhone || undefined,
                      });
                      setWalkName("");
                      setWalkPhone("");
                      setWalkOpen(false);
                      await refresh();
                      await showAlert({
                        title: "Corte registrado",
                        message: res.message ?? "El horario quedó ocupado.",
                      });
                    } catch (err) {
                      await showAlert({
                        title: "No se pudo registrar",
                        message: err instanceof Error ? err.message : "Intenta de nuevo",
                        tone: "danger",
                      });
                    }
                  }}
                >
                  <label className="text-xs text-bone/55">
                    Servicio
                    <select
                      className="input-field mt-1 !min-h-11"
                      value={walkServiceId}
                      onChange={(e) => setWalkServiceId(e.target.value)}
                    >
                      {walkCatalog.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} · {formatMxn(s.priceCents)} · {s.durationMin} min
                        </option>
                      ))}
                    </select>
                  </label>
                  {isSuperAdmin ? (
                    <div className="sm:col-span-2">
                      <p className="text-xs text-bone/55">Barbero</p>
                      <div className="mt-2">
                        <BarberPick
                          barbers={histBarbers}
                          value={walkBarberId}
                          onChange={setWalkBarberId}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="self-end text-sm text-bone/70">
                      Se asigna a {staff?.barberName ?? userName}
                    </p>
                  )}
                  <input
                    className="input-field !min-h-11"
                    placeholder="Nombre del cliente"
                    value={walkName}
                    onChange={(e) => setWalkName(e.target.value)}
                  />
                  <input
                    className="input-field !min-h-11"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="WhatsApp (opcional)"
                    value={walkPhone}
                    onChange={(e) => setWalkPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  />
                  <button type="submit" className="btn-gold !min-h-11 !rounded-xl sm:col-span-2">
                    Ocupar horario y registrar
                  </button>
                </form>
              ) : null}
            </div>
          <ul className="space-y-3">
            {rows.map((row) => (
              <li key={row.id} className="rounded-xl border border-white/10 bg-charcoal/80 p-3.5 sm:p-4">
                <div className="flex flex-col gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium sm:text-base">
                      {formatTime(row.startAt)}–{formatTime(row.endAt)}
                    </p>
                    <p className="text-sm text-bone/90">
                      {row.service.name}
                      {row.source === "WALK_IN" ? " · En local" : ""}
                    </p>
                    <p className="mt-1 break-words text-sm text-bone/70">
                      {row.client.name} · {phoneLabel(row.client.phone)}
                    </p>
                    {row.notes ? (
                      <p className="mt-1 text-sm text-bone/55">Nota: {row.notes}</p>
                    ) : null}
                    <p className="mt-1 text-sm text-gold">
                      {row.barber.name}
                      {row.barber.nickname ? ` (${row.barber.nickname})` : ""} ·{" "}
                      {formatMxn(row.priceCents)} · {STATUS_LABEL[row.status] ?? row.status}
                    </p>
                    {staffActionsFor(row.status).canCharge && (
                      <div className="mt-3 space-y-2 rounded-xl border border-gold/25 bg-ink/40 p-3">
                        <label className="flex items-center gap-2 text-xs text-bone/60">
                          Propina MXN
                          <input
                            type="number"
                            min={0}
                            step="1"
                            inputMode="decimal"
                            className="input-field !min-h-10 !w-24 !py-2"
                            value={tipById[row.id] ?? "0"}
                            onChange={(e) =>
                              setTipById((prev) => ({ ...prev, [row.id]: e.target.value }))
                            }
                          />
                        </label>
                        {(() => {
                          const tipCents = tipCentsFromInput(tipById[row.id]);
                          const total = row.priceCents + tipCents;
                          return (
                            <p className="text-sm leading-relaxed text-gold-soft animate-fade-up">
                              El costeo fue de {formatMxn(row.priceCents)}, la propina de{" "}
                              {formatMxn(tipCents)}; en total a cobrar es de{" "}
                              <strong className="text-gold">{formatMxn(total)}</strong>.
                            </p>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                    {(() => {
                      const actions = staffActionsFor(row.status);
                      if (actions.readOnly) {
                        return (
                          <span className="col-span-2 rounded-md border border-white/10 px-3 py-2.5 text-center text-xs text-bone/45">
                            Cerrada · sin acciones
                          </span>
                        );
                      }
                      return (
                        <>
                          {actions.canCheckIn && (
                            <button
                              type="button"
                              onClick={async () => {
                                const ok = await ask({
                                  title: "Check-in",
                                  message: "¿Confirmas que el cliente ya llegó?",
                                  confirmLabel: "Sí, llegó",
                                  cancelLabel: "Cancelar",
                                  tone: "gold",
                                });
                                if (!ok) return;
                                try {
                                  await api.updateStatus(row.id, "CHECKED_IN");
                                  await refresh();
                                  await showAlert({
                                    title: "Check-in listo",
                                    message: "Check-in registrado. Ahora puedes cobrar.",
                                  });
                                } catch (e) {
                                  await showAlert({
                                    title: "Error",
                                    message: e instanceof Error ? e.message : "No se pudo hacer check-in",
                                    tone: "danger",
                                  });
                                }
                              }}
                              className="min-h-11 rounded-xl border border-white/20 px-3 py-2.5 text-xs sm:text-sm"
                            >
                              Check-in
                            </button>
                          )}
                          {actions.canCharge && (
                            <button
                              type="button"
                              onClick={async () => {
                                const tipCents = tipCentsFromInput(tipById[row.id]);
                                const ok = await ask({
                                  title: "Cobrar cita",
                                  message: `Servicio ${formatMxn(row.priceCents)}${
                                    tipCents > 0 ? ` + propina ${formatMxn(tipCents)}` : ""
                                  } = total ${formatMxn(row.priceCents + tipCents)}. ¿Confirmar cobro y comisión?`,
                                  confirmLabel: "Cobrar",
                                  cancelLabel: "Cancelar",
                                  tone: "gold",
                                });
                                if (!ok) return;
                                try {
                                  await api.markPaid(row.id, tipCents);
                                  await refresh();
                                  await showAlert({
                                    title: "Cobro registrado",
                                    message: "Comisión y propina calculadas.",
                                  });
                                } catch (e) {
                                  await showAlert({
                                    title: "Error",
                                    message: e instanceof Error ? e.message : "No se pudo cobrar",
                                    tone: "danger",
                                  });
                                }
                              }}
                              className="min-h-11 rounded-xl bg-bone px-3 py-2.5 text-xs font-semibold text-ink sm:text-sm"
                            >
                              Cobrar
                            </button>
                          )}
                          {actions.canCancel && (
                            <button
                              type="button"
                              onClick={async () => {
                                const ok = await ask({
                                  title: "Cancelar cita",
                                  message: "¿Cancelar esta cita? Esta acción no se puede deshacer fácilmente.",
                                  confirmLabel: "Sí, cancelar",
                                  cancelLabel: "Volver",
                                  tone: "danger",
                                });
                                if (!ok) return;
                                try {
                                  const res = await api.cancelAppointment(row.id);
                                  await refresh();
                                  await showAlert({
                                    title: "Cita cancelada",
                                    message: res.data.cancellation?.message ?? "La cita fue cancelada.",
                                  });
                                } catch (e) {
                                  await showAlert({
                                    title: "Error",
                                    message: e instanceof Error ? e.message : "No se pudo cancelar",
                                    tone: "danger",
                                  });
                                }
                              }}
                              className="min-h-11 rounded-xl border border-brickSoft/50 px-3 py-2.5 text-xs text-brickSoft sm:text-sm"
                            >
                              Cancelar
                            </button>
                          )}
                          {actions.canNoShow && (
                            <button
                              type="button"
                              onClick={async () => {
                                const ok = await ask({
                                  title: "No show",
                                  message: "¿Marcar como no show (el cliente no llegó)?",
                                  confirmLabel: "Marcar no show",
                                  cancelLabel: "Volver",
                                  tone: "danger",
                                });
                                if (!ok) return;
                                try {
                                  await api.updateStatus(row.id, "NO_SHOW");
                                  await refresh();
                                  await showAlert({
                                    title: "No show",
                                    message: "Cita marcada como no show.",
                                  });
                                } catch (e) {
                                  await showAlert({
                                    title: "Error",
                                    message: e instanceof Error ? e.message : "No se pudo actualizar",
                                    tone: "danger",
                                  });
                                }
                              }}
                              className="min-h-11 rounded-xl border border-white/15 px-3 py-2.5 text-xs sm:text-sm"
                            >
                              No llegó aquí
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </li>
            ))}
            {!loading && rows.length === 0 && (
              <li className="text-sm text-bone/55">No hay citas este día.</li>
            )}
          </ul>
          </div>
        )}

        {tab === "historial" && (
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-gold/25 bg-ink/50 p-3.5 sm:p-4">
              <p className="text-sm font-medium text-gold">Historial de reservas</p>
              <p className="mt-1 text-xs text-bone/55">
                Escribe y busca en cliente, WhatsApp, barbero, servicio, nota, estado, precio o comisión.
              </p>
              <input
                className="input-field mt-3 !min-h-12"
                placeholder="Buscar en todo: cliente, WhatsApp, barbero, servicio…"
                value={histFilters.q}
                onChange={(e) => setHistFilters((f) => ({ ...f, q: e.target.value }))}
                aria-label="Buscar en el historial"
              />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="btn-ghost !min-h-11 !rounded-xl"
                  aria-expanded={moreFilters}
                  onClick={() => setMoreFilters((open) => !open)}
                >
                  {moreFilters ? "Menos filtros" : "Más filtros"}
                  {[
                    histFilters.dateFrom,
                    histFilters.dateTo,
                    histFilters.serviceId,
                    histFilters.barberId,
                    histFilters.status,
                    histFilters.minPrice,
                    histFilters.maxPrice,
                    histFilters.hasCommission,
                  ].filter(Boolean).length > 0
                    ? ` · ${
                        [
                          histFilters.dateFrom,
                          histFilters.dateTo,
                          histFilters.serviceId,
                          histFilters.barberId,
                          histFilters.status,
                          histFilters.minPrice,
                          histFilters.maxPrice,
                          histFilters.hasCommission,
                        ].filter(Boolean).length
                      }`
                    : ""}
                </button>
                {histFilters.q ? (
                  <button
                    type="button"
                    className="text-sm text-bone/60 underline-offset-2 hover:text-gold hover:underline"
                    onClick={() => setHistFilters((f) => ({ ...f, q: "" }))}
                  >
                    Limpiar búsqueda
                  </button>
                ) : null}
              </div>
              {moreFilters ? (
                <div className="mt-3 space-y-3 border-t border-white/10 pt-3">
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    <label className="text-xs text-bone/50">
                      Desde
                      <input
                        type="date"
                        className="input-field mt-1 !min-h-11"
                        value={histFilters.dateFrom}
                        onChange={(e) => setHistFilters((f) => ({ ...f, dateFrom: e.target.value }))}
                      />
                    </label>
                    <label className="text-xs text-bone/50">
                      Hasta
                      <input
                        type="date"
                        className="input-field mt-1 !min-h-11"
                        value={histFilters.dateTo}
                        onChange={(e) => setHistFilters((f) => ({ ...f, dateTo: e.target.value }))}
                      />
                    </label>
                    <label className="text-xs text-bone/50">
                      Servicio
                      <select
                        className="input-field mt-1 !min-h-11"
                        value={histFilters.serviceId}
                        onChange={(e) => setHistFilters((f) => ({ ...f, serviceId: e.target.value }))}
                      >
                        <option value="">Todos los servicios</option>
                        {histServices.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-xs text-bone/50">
                      Barbero
                      <select
                        className="input-field mt-1 !min-h-11"
                        value={histFilters.barberId}
                        onChange={(e) => setHistFilters((f) => ({ ...f, barberId: e.target.value }))}
                      >
                        <option value="">Todos los barberos</option>
                        {histBarbers.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                            {b.nickname ? ` (${b.nickname})` : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-xs text-bone/50">
                      Estado
                      <select
                        className="input-field mt-1 !min-h-11"
                        value={histFilters.status}
                        onChange={(e) => setHistFilters((f) => ({ ...f, status: e.target.value }))}
                      >
                        <option value="">Todos los estados</option>
                        {Object.entries(STATUS_LABEL).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-xs text-bone/50">
                      Precio mín MXN
                      <input
                        className="input-field mt-1 !min-h-11"
                        type="number"
                        min={0}
                        placeholder="Ej. 100"
                        value={histFilters.minPrice}
                        onChange={(e) => setHistFilters((f) => ({ ...f, minPrice: e.target.value }))}
                      />
                    </label>
                    <label className="text-xs text-bone/50">
                      Precio máx MXN
                      <input
                        className="input-field mt-1 !min-h-11"
                        type="number"
                        min={0}
                        placeholder="Ej. 500"
                        value={histFilters.maxPrice}
                        onChange={(e) => setHistFilters((f) => ({ ...f, maxPrice: e.target.value }))}
                      />
                    </label>
                    <label className="text-xs text-bone/50">
                      Comisión
                      <select
                        className="input-field mt-1 !min-h-11"
                        value={histFilters.hasCommission}
                        onChange={(e) =>
                          setHistFilters((f) => ({
                            ...f,
                            hasCommission: e.target.value as "" | "yes" | "no",
                          }))
                        }
                      >
                        <option value="">Todas</option>
                        <option value="yes">Con comisión</option>
                        <option value="no">Sin comisión</option>
                      </select>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="btn-gold !min-h-11 !rounded-xl" onClick={refresh}>
                      Aplicar filtros
                    </button>
                    <button
                      type="button"
                      className="btn-ghost !min-h-11 !rounded-xl"
                      onClick={async () => {
                        const empty = {
                          dateFrom: "",
                          dateTo: "",
                          q: histFilters.q,
                          serviceId: "",
                          barberId: "",
                          status: "",
                          minPrice: "",
                          maxPrice: "",
                          hasCommission: "" as const,
                        };
                        setHistFilters(empty);
                        setLoading(true);
                        setError("");
                        try {
                          const hist = await api.searchAppointments(empty);
                          setHistoryRows(hist.data);
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "Error al cargar");
                        } finally {
                          setLoading(false);
                        }
                      }}
                    >
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
            <p className="text-xs text-bone/45">
              {loading ? "Buscando…" : `${historyRows.length} resultado${historyRows.length === 1 ? "" : "s"}`}
            </p>
            <ul className="space-y-3">
              {historyRows.map((row) => (
                <li
                  key={row.id}
                  className="rounded-xl border border-white/10 bg-charcoal/80 p-3.5 animate-fade-up"
                >
                  <p className="text-sm font-medium">
                    {formatTime(row.startAt)}–{formatTime(row.endAt)} ·{" "}
                    {row.startAt.slice(0, 10)}
                  </p>
                  <p className="text-sm text-bone/90">{row.service.name}</p>
                  <p className="mt-1 text-sm text-bone/70">
                    {row.client.name} · {phoneLabel(row.client.phone)}
                  </p>
                  <p className="mt-1 text-sm text-gold">
                    {row.barber.name}
                    {row.barber.nickname ? ` (${row.barber.nickname})` : ""} ·{" "}
                    {formatMxn(row.priceCents)} · {STATUS_LABEL[row.status] ?? row.status}
                  </p>
                  {row.commission ? (
                    <p className="mt-1 text-xs text-gold-soft">
                      Comisión {row.commission.commissionPercent}% · Barbero{" "}
                      {formatMxn(row.commission.barberEarnCents)} · Tienda{" "}
                      {formatMxn(row.commission.shopEarnCents)} · Propina{" "}
                      {formatMxn(row.commission.tipCents)}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-bone/40">Sin comisión registrada</p>
                  )}
                </li>
              ))}
              {!loading && historyRows.length === 0 && (
                <li className="text-sm text-bone/55">Sin resultados con esos filtros.</li>
              )}
            </ul>
          </div>
        )}

        {tab === "catalogo" && (
          <ul className="mt-6 space-y-3">
            {services.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-charcoal/80 p-4"
              >
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-sm text-bone/60">
                    {s.durationMin} min · {formatMxn(s.priceCents)} · {s.code}
                    {!s.active ? " · inactivo" : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const nextActive = !s.active;
                    const ok = await ask({
                      title: nextActive ? "Activar servicio" : "Desactivar servicio",
                      message: nextActive
                        ? `¿Activar «${s.name}» en el catálogo?`
                        : `¿Desactivar «${s.name}»? Dejará de mostrarse para reservas.`,
                      confirmLabel: nextActive ? "Activar" : "Desactivar",
                      cancelLabel: "Volver",
                      tone: nextActive ? "gold" : "danger",
                    });
                    if (!ok) return;
                    try {
                      await api.setServiceActive(s.id, nextActive);
                      await refresh();
                      await showAlert({
                        title: "Catálogo",
                        message: nextActive ? "Servicio activado." : "Servicio desactivado.",
                      });
                    } catch (e) {
                      await showAlert({
                        title: "Error",
                        message: e instanceof Error ? e.message : "No se pudo actualizar",
                        tone: "danger",
                      });
                    }
                  }}
                  className={`rounded-md border border-white/20 px-3 py-1.5 text-xs ${
                    isSuperAdmin ? "" : "hidden"
                  }`}
                >
                  {s.active ? "Desactivar" : "Activar"}
                </button>
              </li>
            ))}
          </ul>
        )}

        {tab === "espera" && (
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-gold/20 bg-ink/45 p-3.5">
              <p className="text-sm font-medium text-gold">Lista de espera</p>
              <p className="mt-1 text-xs leading-relaxed text-bone/60">
                Aquí aparecen clientes que no encontraron horario libre y pidieron avisarles.
                Verás nombre, WhatsApp, servicio, barbero (si eligió), fecha pedida y estado.
                Usa <strong>Notificado</strong> cuando ya los contactaste y{" "}
                <strong>Quitar</strong> si ya no esperan.
              </p>
            </div>
          <ul className="space-y-3">
            {waitlist.map((w) => (
              <li
                key={w.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-charcoal/80 p-4 animate-fade-up"
              >
                <div>
                  <p className="font-medium">
                    {w.client.name} · {w.client.phone}
                  </p>
                  <p className="text-sm text-bone/60">
                    {w.service.name}
                    {w.barber ? ` · ${w.barber.name}` : " · cualquier barbero"} · {w.date}
                    {w.preferredTime ? ` · prefiere ${w.preferredTime}` : ""} · {w.status}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await ask({
                        title: "Lista de espera",
                        message: `¿Marcar a ${w.client.name} como notificado?`,
                        confirmLabel: "Notificado",
                        cancelLabel: "Volver",
                      });
                      if (!ok) return;
                      try {
                        await api.updateWaitlist(w.id, "NOTIFIED");
                        await refresh();
                      } catch (e) {
                        await showAlert({
                          title: "Error",
                          message: e instanceof Error ? e.message : "No se pudo actualizar",
                          tone: "danger",
                        });
                      }
                    }}
                    className="rounded-md border border-white/20 px-3 py-1.5 text-xs"
                  >
                    Notificado
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await ask({
                        title: "Quitar de espera",
                        message: `¿Quitar a ${w.client.name} de la lista de espera?`,
                        confirmLabel: "Quitar",
                        cancelLabel: "Volver",
                        tone: "danger",
                      });
                      if (!ok) return;
                      try {
                        await api.updateWaitlist(w.id, "CANCELLED");
                        await refresh();
                      } catch (e) {
                        await showAlert({
                          title: "Error",
                          message: e instanceof Error ? e.message : "No se pudo actualizar",
                          tone: "danger",
                        });
                      }
                    }}
                    className="rounded-md border border-brickSoft/40 px-3 py-1.5 text-xs"
                  >
                    Quitar
                  </button>
                </div>
              </li>
            ))}
            {!loading && waitlist.length === 0 && (
              <li className="text-sm text-bone/55">
                No hay nadie en espera para esta fecha. Cuando un cliente no encuentra horario y se
                une a la lista, aparecerá aquí.
              </li>
            )}
          </ul>
          </div>
        )}

        {tab === "tienda" && (
          <ul className="mt-6 space-y-3">
            {products.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-charcoal/80 p-4"
              >
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-bone/60">
                    {p.sku} · {formatMxn(p.priceCents)} · stock {p.stock}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={p.stock}
                    value={sellQty[p.id] ?? 1}
                    onChange={(e) =>
                      setSellQty((prev) => ({ ...prev, [p.id]: Number(e.target.value) || 1 }))
                    }
                    className="w-16 rounded border border-white/20 bg-ink px-2 py-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const qty = sellQty[p.id] ?? 1;
                      const ok = await ask({
                        title: "Registrar venta",
                        message: `¿Vender ${qty} × ${p.name} (${formatMxn(p.priceCents * qty)})?`,
                        confirmLabel: "Vender",
                        cancelLabel: "Cancelar",
                      });
                      if (!ok) return;
                      try {
                        const res = await api.sellProducts([{ productId: p.id, quantity: qty }]);
                        await refresh();
                        await showAlert({
                          title: "Venta registrada",
                          message: res.data.message ?? `Total ${formatMxn(res.data.totalCents)}`,
                        });
                      } catch (e) {
                        await showAlert({
                          title: "Error",
                          message: e instanceof Error ? e.message : "No se pudo vender",
                          tone: "danger",
                        });
                      }
                    }}
                    className="rounded-md bg-bone px-3 py-1.5 text-xs font-semibold text-ink"
                  >
                    Vender
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {tab === "comisiones" && (
          <div className="mt-6 space-y-6">
            <div className="rounded-xl border border-gold/25 bg-ink/50 p-3.5 sm:p-4">
              <p className="text-sm font-medium text-gold">Resumen de comisiones</p>
              <p className="mt-1 text-xs text-bone/55">
                Elige un día o un rango. Abajo ves, por cada día, cuánto generó cada barbero y
                cuánto hay que pagarle según su porcentaje. La propina va completa al barbero.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <label className="text-xs text-bone/55">
                  Desde
                  <input
                    type="date"
                    className="input-field mt-1 !min-h-11"
                    value={commFrom}
                    onChange={(e) => setCommFrom(e.target.value)}
                  />
                </label>
                <label className="text-xs text-bone/55">
                  Hasta
                  <input
                    type="date"
                    className="input-field mt-1 !min-h-11"
                    value={commTo}
                    onChange={(e) => setCommTo(e.target.value)}
                  />
                </label>
                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    className="btn-gold !min-h-11 flex-1 !rounded-xl"
                    onClick={refresh}
                  >
                    Aplicar
                  </button>
                  <button
                    type="button"
                    className="btn-ghost !min-h-11 !rounded-xl !px-3"
                    onClick={() => {
                      const today = todayMx();
                      setCommFrom(today);
                      setCommTo(today);
                    }}
                  >
                    Hoy
                  </button>
                </div>
              </div>
            </div>

            {commissionTotals && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  ["Servicios", commissionTotals.count],
                  ["Monto servicios", formatMxn(commissionTotals.serviceCents ?? 0)],
                  ["Barberos", formatMxn(commissionTotals.barberEarnCents)],
                  ["Tienda", formatMxn(commissionTotals.shopEarnCents)],
                  ["Propinas", formatMxn(commissionTotals.tipCents)],
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-xl border border-brick/30 bg-charcoal/80 p-4">
                    <p className="text-xs uppercase tracking-wider text-bone/50">{label}</p>
                    <p className="mt-2 text-xl font-semibold text-gold">{value}</p>
                  </div>
                ))}
              </div>
            )}

            {commissionTotals && (commissionTotals.byDay?.length ?? 0) > 0 && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">
                  Pago por día
                </h3>
                <p className="mt-1 text-xs text-bone/50">
                  Generó es el costo de los servicios cobrados ese día. A pagarle es su porcentaje
                  de esos servicios más las propinas.
                </p>
                <div className="mt-3 space-y-4">
                  {commissionTotals.byDay?.map((day) => (
                    <section
                      key={day.date}
                      className="rounded-xl border border-gold/25 bg-ink/50 p-3.5 sm:p-4"
                    >
                      <div className="flex flex-wrap items-end justify-between gap-2">
                        <p className="text-base font-medium capitalize text-bone">
                          {formatDayLabel(day.date)}
                        </p>
                        <p className="text-xs text-bone/60">
                          Generó {formatMxn(day.serviceCents)} · A barberos{" "}
                          {formatMxn(day.payCents)} · Tienda {formatMxn(day.shopCents)}
                        </p>
                      </div>
                      <ul className="mt-3 space-y-2">
                        {day.barbers.map((b) => (
                          <li
                            key={b.barberId}
                            className="rounded-lg border border-white/10 bg-charcoal/80 px-3 py-3 text-sm"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <p className="font-medium">
                                {b.barberName}
                                <span className="text-bone/50">
                                  {" "}
                                  · {b.percents.map((p) => `${p}%`).join(" · ")} · {b.count}{" "}
                                  servicio{b.count === 1 ? "" : "s"}
                                </span>
                              </p>
                              <p className="text-base font-semibold text-gold">
                                A pagarle {formatMxn(b.payCents)}
                              </p>
                            </div>
                            <p className="mt-1 text-bone/70">
                              Generó {formatMxn(b.serviceCents)}
                              {" · porcentaje "}
                              {formatMxn(b.commissionCents)}
                              {" · propinas "}
                              {formatMxn(b.tipCents)}
                              {" · tienda "}
                              {formatMxn(b.shopCents)}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              </div>
            )}

            {commissionTotals && commissionTotals.byBarber.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">
                  Total del periodo por barbero
                </h3>
                <ul className="mt-3 space-y-2">
                  {commissionTotals.byBarber.map((b) => (
                    <li
                      key={b.barberId}
                      className="rounded-lg border border-white/10 bg-ink/50 px-4 py-3 text-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="font-medium">{b.barberName}</span>
                          <span className="text-bone/50">
                            {" "}
                            · {b.count} servicio{b.count === 1 ? "" : "s"}
                          </span>
                          <span className="mt-1 block text-bone/70">
                            Generó {formatMxn(b.serviceCents ?? 0)}
                            {" · porcentaje "}
                            {formatMxn(b.commissionCents ?? b.barberEarnCents - b.tipCents)}
                            {" · propinas "}
                            {formatMxn(b.tipCents)}
                            {" · a pagarle "}
                            <span className="text-gold">{formatMxn(b.barberEarnCents)}</span>
                            {" · tienda "}
                            {formatMxn(b.shopEarnCents)}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="shrink-0 rounded-xl border border-gold/40 px-3 py-2 text-xs text-gold"
                          onClick={() => setDetailBarberId(b.barberId)}
                        >
                          Ver más
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {isSuperAdmin ? (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">
                % Comisión por barbero
              </h3>
              <p className="mt-1 text-xs text-bone/50">
                Cada barbero tiene su propio % del servicio (0–100). La propina se reparte al 100%
                al barbero. Vista previa con ejemplo de servicio {formatMxn(EXAMPLE_SERVICE_CENTS)}.
              </p>
              <ul className="mt-3 space-y-3">
                {adminBarbers.map((b) => {
                  const raw = barberPctDraft[b.id] ?? String(b.commissionPercent);
                  const pct = Number(raw);
                  const valid = Number.isFinite(pct) && pct >= 0 && pct <= 100;
                  const split = valid
                    ? previewSplit(EXAMPLE_SERVICE_CENTS, pct, 1000)
                    : null;
                  return (
                  <li
                    key={b.id}
                    className="rounded-lg border border-white/10 bg-charcoal/80 px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                    <span className="min-w-[140px] font-medium">
                      {b.name}
                      {b.nickname ? ` (${b.nickname})` : ""}
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="1"
                      className={`w-20 rounded border bg-ink px-2 py-1 text-sm ${
                        valid ? "border-white/20" : "border-brick-soft animate-shake"
                      }`}
                      value={raw}
                      onChange={(e) => {
                        const next = e.target.value;
                        const n = Number(next);
                        if (next !== "" && Number.isFinite(n) && n > 100) {
                          setBarberPctDraft((prev) => ({ ...prev, [b.id]: "100" }));
                          void showAlert({
                            title: "Máximo 100%",
                            message: "La comisión de un barbero no puede superar el 100%.",
                            tone: "danger",
                          });
                          return;
                        }
                        if (next !== "" && Number.isFinite(n) && n < 0) {
                          setBarberPctDraft((prev) => ({ ...prev, [b.id]: "0" }));
                          return;
                        }
                        setBarberPctDraft((prev) => ({ ...prev, [b.id]: next }));
                      }}
                    />
                    <span className="text-xs text-bone/50">%</span>
                    <button
                      type="button"
                      className="rounded-md bg-bone px-3 py-1.5 text-xs font-semibold text-ink"
                      onClick={async () => {
                        const pctNum = Number(barberPctDraft[b.id]);
                        if (!Number.isFinite(pctNum) || pctNum < 0 || pctNum > 100) {
                          await showAlert({
                            title: "Dato inválido",
                            message: "El % debe estar entre 0 y 100.",
                            tone: "danger",
                          });
                          return;
                        }
                        const ok = await ask({
                          title: "Guardar comisión",
                          message: `¿Dejar la comisión de ${b.name} en ${pctNum}%?`,
                          confirmLabel: "Guardar",
                          cancelLabel: "Cancelar",
                        });
                        if (!ok) return;
                        try {
                          await api.updateBarberCommission(b.id, pctNum);
                          await refresh();
                          await showAlert({
                            title: "Comisión actualizada",
                            message: `${b.name} quedó en ${pctNum}%.`,
                          });
                        } catch (e) {
                          await showAlert({
                            title: "Error",
                            message: e instanceof Error ? e.message : "No se pudo guardar",
                            tone: "danger",
                          });
                        }
                      }}
                    >
                      Guardar
                    </button>
                    </div>
                    {split ? (
                      <p className="mt-2 text-xs leading-relaxed text-gold-soft animate-fade-up">
                        Ejemplo servicio {formatMxn(EXAMPLE_SERVICE_CENTS)} + propina{" "}
                        {formatMxn(1000)}: barbero{" "}
                        <strong>{formatMxn(split.barberTotal)}</strong> (serv.{" "}
                        {formatMxn(split.barberService)} + propina {formatMxn(split.tip)}) · tienda{" "}
                        {formatMxn(split.shop)}. Propina = 100% al barbero.
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-brick-soft">Escribe un % entre 0 y 100.</p>
                    )}
                  </li>
                  );
                })}
              </ul>
            </div>
            ) : null}

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">
                Servicios cobrados en el periodo
              </h3>
              <ul className="mt-3 space-y-3">
                {commissions.map((c) => (
                  <li
                    key={c.id}
                    className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-white/10 bg-charcoal/80 p-4"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">
                        {c.appointment.barber.name} · {c.appointment.service.name}
                      </p>
                      <p className="text-sm text-bone/60">
                        {c.appointment.client.name}
                        {c.appointment.client.phone ? ` · ${c.appointment.client.phone}` : ""}
                      </p>
                      {c.appointment.startAt ? (
                        <p className="mt-0.5 text-xs text-bone/45">
                          {c.appointment.startAt.slice(0, 10)} · {formatTime(c.appointment.startAt)}
                        </p>
                      ) : null}
                      <p className="mt-1 text-sm text-gold">
                        Servicio {formatMxn(c.serviceCents)} · Barbero {formatMxn(c.barberEarnCents)} ·
                        Tienda {formatMxn(c.shopEarnCents)} · Propina {formatMxn(c.tipCents)} ·{" "}
                        {c.commissionPercent}%
                      </p>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 rounded-xl border border-gold/40 px-3 py-2 text-xs text-gold"
                      onClick={() => setDetailCommissionId(c.id)}
                    >
                      Ver más
                    </button>
                  </li>
                ))}
                {!loading && commissions.length === 0 && (
                  <li className="text-sm text-bone/55">Sin comisiones en ese periodo.</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {tab === "stats" && stats && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Citas", stats.appointments],
              ["Completadas", stats.completed],
              ["Canceladas", stats.cancelled],
              ["No show", stats.noShow],
              ["Ingresos MXN", `$${stats.revenueMxn}`],
              ["Propinas MXN", `$${stats.tipsMxn}`],
              ["Barberos MXN", `$${stats.barberEarnMxn ?? 0}`],
              ["Tienda MXN", `$${stats.shopEarnMxn ?? 0}`],
              ["Ocupación", stats.occupancyHint ?? "—"],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-xl border border-white/10 bg-charcoal/80 p-4">
                <p className="text-xs uppercase tracking-wider text-bone/50">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-gold">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {(() => {
        const barberRows = detailBarberId
          ? commissions.filter((c) => c.barberId === detailBarberId)
          : [];
        const barberMeta = commissionTotals?.byBarber.find((b) => b.barberId === detailBarberId);
        return (
          <DetailModal
            open={Boolean(detailBarberId)}
            title={barberMeta?.barberName ?? "Detalle barbero"}
            subtitle={
              barberMeta
                ? `${barberMeta.count} servicio(s) · ${formatMxn(barberMeta.serviceCents ?? 0)} en servicios · gana ${formatMxn(barberMeta.barberEarnCents)}`
                : undefined
            }
            onClose={() => setDetailBarberId(null)}
          >
            <ul className="space-y-3">
              {barberRows.map((c) => (
                <li
                  key={c.id}
                  className="rounded-xl border border-white/10 bg-ink/60 p-3 text-sm"
                >
                  <p className="font-medium text-bone">{c.appointment.service.name}</p>
                  <p className="mt-1 text-bone/70">
                    {c.appointment.client.name}
                    {c.appointment.client.phone ? ` · ${c.appointment.client.phone}` : ""}
                  </p>
                  {c.appointment.startAt ? (
                    <p className="text-xs text-bone/45">
                      {c.appointment.startAt.slice(0, 10)} · {formatTime(c.appointment.startAt)}
                      {c.appointment.endAt ? `–${formatTime(c.appointment.endAt)}` : ""}
                    </p>
                  ) : null}
                  <p className="mt-2 text-gold-soft">
                    Servicio {formatMxn(c.serviceCents)} · Comisión {c.commissionPercent}% ·
                    Barbero {formatMxn(c.barberEarnCents)} · Tienda {formatMxn(c.shopEarnCents)} ·
                    Propina {formatMxn(c.tipCents)} (100% barbero)
                  </p>
                  {c.appointment.notes ? (
                    <p className="mt-1 text-xs text-bone/50">Nota: {c.appointment.notes}</p>
                  ) : null}
                </li>
              ))}
              {barberRows.length === 0 ? (
                <li className="text-sm text-bone/55">Sin servicios en este periodo.</li>
              ) : null}
            </ul>
          </DetailModal>
        );
      })()}

      {(() => {
        const c = commissions.find((row) => row.id === detailCommissionId);
        return (
          <DetailModal
            open={Boolean(detailCommissionId && c)}
            title={c?.appointment.service.name ?? "Detalle del servicio"}
            subtitle={
              c
                ? `${c.appointment.barber.name} · ${formatMxn(c.serviceCents)}`
                : undefined
            }
            onClose={() => setDetailCommissionId(null)}
          >
            {c ? (
              <div className="space-y-3 text-sm">
                <div className="rounded-xl border border-gold/25 bg-ink/50 p-3">
                  <p className="text-[11px] uppercase tracking-wider text-gold">Cliente</p>
                  <p className="mt-1 font-medium text-bone">{c.appointment.client.name}</p>
                  <p className="text-bone/70">
                    WhatsApp: {c.appointment.client.phone ?? "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-ink/50 p-3">
                  <p className="text-[11px] uppercase tracking-wider text-gold">Cita</p>
                  <p className="mt-1 text-bone">
                    {c.appointment.startAt
                      ? `${c.appointment.startAt.slice(0, 10)} · ${formatTime(c.appointment.startAt)}${
                          c.appointment.endAt ? `–${formatTime(c.appointment.endAt)}` : ""
                        }`
                      : "—"}
                  </p>
                  <p className="text-bone/70">
                    Barbero: {c.appointment.barber.name}
                    {c.appointment.barber.nickname
                      ? ` (${c.appointment.barber.nickname})`
                      : ""}
                  </p>
                  <p className="text-bone/70">Servicio: {c.appointment.service.name}</p>
                  {c.appointment.notes ? (
                    <p className="mt-1 text-bone/55">Nota: {c.appointment.notes}</p>
                  ) : null}
                </div>
                <div className="rounded-xl border border-white/10 bg-ink/50 p-3">
                  <p className="text-[11px] uppercase tracking-wider text-gold">Dinero</p>
                  <ul className="mt-2 space-y-1 text-bone/80">
                    <li>Costo del servicio: <strong className="text-gold">{formatMxn(c.serviceCents)}</strong></li>
                    <li>Comisión aplicada: {c.commissionPercent}%</li>
                    <li>Para el barbero (servicio): {formatMxn(c.barberEarnCents - c.tipCents)}</li>
                    <li>Propina (100% barbero): {formatMxn(c.tipCents)}</li>
                    <li>
                      Total barbero:{" "}
                      <strong className="text-gold">{formatMxn(c.barberEarnCents)}</strong>
                    </li>
                    <li>Para la tienda: {formatMxn(c.shopEarnCents)}</li>
                    <li>
                      Total cobrado:{" "}
                      {formatMxn(c.serviceCents + c.tipCents)}
                    </li>
                  </ul>
                </div>
              </div>
            ) : null}
          </DetailModal>
        );
      })()}
    </main>
  );
}
