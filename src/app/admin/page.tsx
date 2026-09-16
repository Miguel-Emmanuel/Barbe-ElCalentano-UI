"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  api,
  formatMxn,
  formatTime,
  getToken,
  setToken,
  staffActionsFor,
  type AppointmentRow,
  type Service,
  type WaitlistRow,
} from "@/lib/api";
import { BrandTitle } from "@/components/BrandTitle";

const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: "Programada",
  CONFIRMED: "Confirmada",
  CHECKED_IN: "Check-in",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  NO_SHOW: "No show",
};

type Tab = "agenda" | "catalogo" | "espera" | "stats" | "tienda" | "comisiones";

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
  const [email, setEmail] = useState("admin@elcalentano.mx");
  const [password, setPassword] = useState("calentano123");
  const [tab, setTab] = useState<Tab>("agenda");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<AppointmentRow[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistRow[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [commissions, setCommissions] = useState<
    Array<{
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
    }>
  >([]);
  const [commissionTotals, setCommissionTotals] = useState<{
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
  } | null>(null);
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

  useEffect(() => {
    const token = getToken();
    setTokenReady(true);
    if (!token) return;
    api
      .me()
      .then((res) => {
        setAuthed(true);
        setUserName(res.data.name);
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
      if (tab === "comisiones") {
        const [commRes, barberRes] = await Promise.all([
          api.getCommissions(date),
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
  }, [authed, tab, date]);

  if (!tokenReady) {
    return <main className="min-h-screen bg-brick-wall bg-cover bg-center p-8 text-bone/60">Cargando…</main>;
  }

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-brick-wall bg-cover bg-center px-4 text-bone">
        <form
          onSubmit={onLogin}
          className="panel w-full max-w-md p-6"
        >
          <p className="text-xs tracking-[0.25em] text-gold">STAFF</p>
          <BrandTitle as="h1" className="mt-2 text-3xl text-bone">
            El Calentano
          </BrandTitle>
          <p className="mt-1 text-sm text-bone/60">Panel de operaciones</p>
          {error && (
            <p role="alert" className="mt-4 rounded-lg border border-brick/50 bg-brick/20 px-3 py-2 text-sm">
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
            className="mt-5 w-full rounded-full bg-gold py-3 text-sm font-semibold text-ink disabled:opacity-50"
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

  const tabs: Array<[Tab, string]> = [
    ["agenda", "Agenda"],
    ["catalogo", "Servicios"],
    ["espera", "Espera"],
    ["tienda", "Tienda"],
    ["comisiones", "Comisiones"],
    ["stats", "Métricas"],
  ];

  return (
    <main className="min-h-screen bg-brick-wall bg-cover bg-center text-bone">
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
                  setInfo(res.message ?? "Recordatorios procesados");
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Error en recordatorios");
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
              onClick={onLogout}
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
                tab === id ? "bg-gold font-semibold text-ink" : "border border-white/15"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:mt-5 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
          <label className="w-full text-sm sm:w-auto">
            Fecha
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field mt-1 sm:w-auto"
            />
          </label>
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
          <p className="mt-4 rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-gold-soft">
            {info}
          </p>
        )}
        {loading && <p className="mt-4 text-sm text-bone/60">Cargando…</p>}

        {tab === "agenda" && (
          <ul className="mt-5 space-y-3 sm:mt-6">
            {rows.map((row) => (
              <li key={row.id} className="rounded-xl border border-white/10 bg-charcoal/80 p-3.5 sm:p-4">
                <div className="flex flex-col gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium sm:text-base">
                      {formatTime(row.startAt)}–{formatTime(row.endAt)}
                    </p>
                    <p className="text-sm text-bone/90">{row.service.name}</p>
                    <p className="mt-1 break-words text-sm text-bone/70">
                      {row.client.name} · {row.client.phone}
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
                      <label className="mt-3 flex items-center gap-2 text-xs text-bone/55">
                        Propina MXN
                        <input
                          type="number"
                          min={0}
                          inputMode="decimal"
                          className="input-field !min-h-10 !w-24 !py-2"
                          value={tipById[row.id] ?? "0"}
                          onChange={(e) =>
                            setTipById((prev) => ({ ...prev, [row.id]: e.target.value }))
                          }
                        />
                      </label>
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
                              onClick={() => {
                                if (!confirm("¿Confirmas que el cliente ya llegó (check-in)?")) return;
                                api
                                  .updateStatus(row.id, "CHECKED_IN")
                                  .then(() => {
                                    setInfo("Check-in registrado. Ahora puedes cobrar.");
                                    return refresh();
                                  })
                                  .catch((e) => setError(e.message));
                              }}
                              className="min-h-11 rounded-xl border border-white/20 px-3 py-2.5 text-xs sm:text-sm"
                            >
                              Check-in
                            </button>
                          )}
                          {actions.canCharge && (
                            <button
                              type="button"
                              onClick={() => {
                                const tipMxn = Number(tipById[row.id] ?? "0");
                                const tipCents = Math.round(
                                  (Number.isFinite(tipMxn) ? tipMxn : 0) * 100,
                                );
                                if (
                                  !confirm(
                                    `¿Cobrar ${formatMxn(row.priceCents)}${
                                      tipCents > 0 ? ` + propina ${formatMxn(tipCents)}` : ""
                                    }? Esto completa la cita y genera comisión.`,
                                  )
                                ) {
                                  return;
                                }
                                api
                                  .markPaid(row.id, tipCents)
                                  .then(() => {
                                    setInfo("Cobro registrado. Comisión y propina calculadas.");
                                    return refresh();
                                  })
                                  .catch((e) => setError(e.message));
                              }}
                              className="min-h-11 rounded-xl bg-gold px-3 py-2.5 text-xs font-semibold text-ink sm:text-sm"
                            >
                              Cobrar
                            </button>
                          )}
                          {actions.canCancel && (
                            <button
                              type="button"
                              onClick={() => {
                                if (!confirm("¿Cancelar esta cita?")) return;
                                api
                                  .cancelAppointment(row.id)
                                  .then((res) => {
                                    setInfo(res.data.cancellation?.message ?? "Cita cancelada");
                                    return refresh();
                                  })
                                  .catch((e) => setError(e.message));
                              }}
                              className="min-h-11 rounded-xl border border-brickSoft/50 px-3 py-2.5 text-xs text-brickSoft sm:text-sm"
                            >
                              Cancelar
                            </button>
                          )}
                          {actions.canNoShow && (
                            <button
                              type="button"
                              onClick={() => {
                                if (!confirm("¿Marcar como no show (no llegó)?")) return;
                                api
                                  .updateStatus(row.id, "NO_SHOW")
                                  .then(() => {
                                    setInfo("Marcado como no show.");
                                    return refresh();
                                  })
                                  .catch((e) => setError(e.message));
                              }}
                              className="min-h-11 rounded-xl border border-white/15 px-3 py-2.5 text-xs sm:text-sm"
                            >
                              No show
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
                  onClick={() =>
                    api.setServiceActive(s.id, !s.active).then(refresh).catch((e) => setError(e.message))
                  }
                  className="rounded-md border border-white/20 px-3 py-1.5 text-xs"
                >
                  {s.active ? "Desactivar" : "Activar"}
                </button>
              </li>
            ))}
          </ul>
        )}

        {tab === "espera" && (
          <ul className="mt-6 space-y-3">
            {waitlist.map((w) => (
              <li
                key={w.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-charcoal/80 p-4"
              >
                <div>
                  <p className="font-medium">
                    {w.client.name} · {w.client.phone}
                  </p>
                  <p className="text-sm text-bone/60">
                    {w.service.name}
                    {w.barber ? ` · ${w.barber.name}` : ""} · {w.date} · {w.status}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      api.updateWaitlist(w.id, "NOTIFIED").then(refresh).catch((e) => setError(e.message))
                    }
                    className="rounded-md border border-white/20 px-3 py-1.5 text-xs"
                  >
                    Notificado
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      api.updateWaitlist(w.id, "CANCELLED").then(refresh).catch((e) => setError(e.message))
                    }
                    className="rounded-md border border-brickSoft/40 px-3 py-1.5 text-xs"
                  >
                    Quitar
                  </button>
                </div>
              </li>
            ))}
            {!loading && waitlist.length === 0 && (
              <li className="text-sm text-bone/55">Lista de espera vacía.</li>
            )}
          </ul>
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
                    onClick={() =>
                      api
                        .sellProducts([{ productId: p.id, quantity: sellQty[p.id] ?? 1 }])
                        .then((res) => {
                          setInfo(res.data.message ?? `Venta ${formatMxn(res.data.totalCents)}`);
                          return refresh();
                        })
                        .catch((e) => setError(e.message))
                    }
                    className="rounded-md bg-gold px-3 py-1.5 text-xs font-semibold text-ink"
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
            {commissionTotals && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Citas cobradas", commissionTotals.count],
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

            {commissionTotals && commissionTotals.byBarber.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">
                  Totales por barbero
                </h3>
                <ul className="mt-3 space-y-2">
                  {commissionTotals.byBarber.map((b) => (
                    <li
                      key={b.barberId}
                      className="rounded-lg border border-white/10 bg-ink/50 px-4 py-3 text-sm"
                    >
                      <span className="font-medium">{b.barberName}</span>
                      <span className="text-bone/50"> · {b.count} cobro(s)</span>
                      <span className="mt-1 block text-gold">
                        Gana {formatMxn(b.barberEarnCents)} (incl. propinas {formatMxn(b.tipCents)})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">
                % Comisión por barbero
              </h3>
              <p className="mt-1 text-xs text-bone/50">
                Aplica a cobros nuevos. Propina = 100% al barbero.
              </p>
              <ul className="mt-3 space-y-2">
                {adminBarbers.map((b) => (
                  <li
                    key={b.id}
                    className="flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-charcoal/80 px-4 py-3"
                  >
                    <span className="min-w-[140px] font-medium">
                      {b.name}
                      {b.nickname ? ` (${b.nickname})` : ""}
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="w-20 rounded border border-white/20 bg-ink px-2 py-1 text-sm"
                      value={barberPctDraft[b.id] ?? String(b.commissionPercent)}
                      onChange={(e) =>
                        setBarberPctDraft((prev) => ({ ...prev, [b.id]: e.target.value }))
                      }
                    />
                    <span className="text-xs text-bone/50">%</span>
                    <button
                      type="button"
                      className="rounded-md bg-gold px-3 py-1.5 text-xs font-semibold text-ink"
                      onClick={() => {
                        const pct = Number(barberPctDraft[b.id]);
                        if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
                          setError("El % debe estar entre 0 y 100.");
                          return;
                        }
                        api
                          .updateBarberCommission(b.id, pct)
                          .then(() => {
                            setInfo(`Comisión de ${b.name} actualizada a ${pct}%.`);
                            return refresh();
                          })
                          .catch((e) => setError(e.message));
                      }}
                    >
                      Guardar
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <ul className="space-y-3">
              {commissions.map((c) => (
                <li key={c.id} className="rounded-xl border border-white/10 bg-charcoal/80 p-4">
                  <p className="font-medium">
                    {c.appointment.barber.name} · {c.appointment.service.name}
                  </p>
                  <p className="text-sm text-bone/60">{c.appointment.client.name}</p>
                  <p className="mt-1 text-sm text-gold">
                    Barbero {formatMxn(c.barberEarnCents)} · Tienda {formatMxn(c.shopEarnCents)} ·
                    Propina {formatMxn(c.tipCents)} · {c.commissionPercent}%
                  </p>
                </li>
              ))}
              {!loading && commissions.length === 0 && (
                <li className="text-sm text-bone/55">Sin comisiones este día.</li>
              )}
            </ul>
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
    </main>
  );
}
