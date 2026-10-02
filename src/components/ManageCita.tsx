"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  api,
  formatMxn,
  formatSlotRange,
  formatTime,
  type Barber,
  type PublicAppointment,
} from "@/lib/api";
import { ARRIVAL_GRACE_MIN, PAYMENT_NOTE } from "@/lib/shopInfo";
import { barberPortrait } from "@/components/BarberPick";
import { DateCalendar } from "@/components/BookingWizard";
import { useConfirmDialog } from "@/components/ConfirmModal";
import { SiteHeader } from "@/components/SiteHeader";
import { todayInMexicoCity } from "@/lib/validation";

function formatDay(iso: string) {
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: "America/Mexico_City",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-brick-wall bg-cover bg-center px-4 pb-16 pt-[calc(4.75rem+env(safe-area-inset-top))]">
        <div className="mx-auto w-full max-w-lg">{children}</div>
      </main>
    </>
  );
}

export function ManageCita({ token }: { token: string }) {
  const { ask, alert, Dialog } = useConfirmDialog();
  const [visit, setVisit] = useState<PublicAppointment | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [barberId, setBarberId] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  async function load(current = token) {
    setLoading(true);
    setError("");
    try {
      const res = await api.getPublicAppointment(current);
      setVisit(res.data);
      setBarberId(res.data.barber.id);
    } catch (e) {
      setVisit(null);
      setError(e instanceof Error ? e.message : "No encontramos esa cita.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [token]);

  useEffect(() => {
    if (!editing || !date || !barberId) return;
    let cancelled = false;
    setSlotsLoading(true);
    api
      .getPublicSlots(token, date, barberId)
      .then((res) => {
        if (!cancelled) setSlots(res.data.slots);
      })
      .catch((e) => {
        if (!cancelled) {
          setSlots([]);
          setError(e instanceof Error ? e.message : "No se pudieron cargar los horarios.");
        }
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [editing, date, barberId, token]);

  async function openEditor() {
    setError("");
    if (barbers.length === 0) {
      const res = await api.getBarbers();
      setBarbers(res.data);
    }
    setDate(todayInMexicoCity());
    setEditing(true);
  }

  async function chooseSlot(startAt: string) {
    if (!visit) return;
    const barber = barbers.find((item) => item.id === barberId);
    const barberName = barber?.name ?? visit.barber.name;
    const ok = await ask({
      title: "Cambiar horario",
      message: `Pasas de ${formatDay(visit.startAt)} ${formatTime(visit.startAt)} con ${visit.barber.name} a ${formatDay(startAt)} ${formatTime(startAt)} con ${barberName}. El servicio y el precio siguen igual.`,
      confirmLabel: "Confirmar cambio",
      cancelLabel: "Seguir viendo horarios",
      tone: "gold",
    });
    if (!ok) return;
    setBusy(true);
    setError("");
    try {
      const res = await api.reschedulePublicAppointment(token, startAt, barberId);
      setVisit(res.data);
      setEditing(false);
      await alert({ title: "Listo", message: "Tu cita quedó en el nuevo horario.", tone: "gold" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cambiar el horario.");
    } finally {
      setBusy(false);
    }
  }

  async function cancelVisit() {
    if (!visit?.cancellationPreview) return;
    const ok = await ask({
      title: "Cancelar cita",
      message: visit.cancellationPreview.message,
      confirmLabel: visit.cancellationPreview.late ? "Cancelar de todas formas" : "Cancelar cita",
      cancelLabel: "Conservar cita",
      tone: visit.cancellationPreview.late ? "danger" : "neutral",
    });
    if (!ok) return;
    setBusy(true);
    setError("");
    try {
      const res = await api.cancelPublicAppointment(token);
      setVisit(res.data.view);
      setEditing(false);
      await alert({
        title: "Cita cancelada",
        message: res.message,
        tone: res.data.cancellation.late ? "danger" : "gold",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cancelar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell>
      {Dialog}
      {loading ? (
        <div className="panel p-6 text-bone">
          <p className="font-medium text-gold">Abriendo tu cita…</p>
          <p className="mt-2 text-sm text-bone/70">Si la agenda acaba de despertar, puede tardar un momento.</p>
        </div>
      ) : null}
      {!loading && error && !visit ? (
        <div className="panel p-6 text-bone">
          <p className="font-medium text-gold-soft">No encontramos esa cita</p>
          <p className="mt-2 text-sm text-bone/80">{error}</p>
          <Link href="/cita" className="btn-gold mt-5 inline-flex !min-h-11 !rounded-xl">
            Buscar con mi código
          </Link>
        </div>
      ) : null}
      {visit ? (
        <article className="panel p-4 sm:p-6">
          <p className="text-[11px] uppercase tracking-[0.16em] text-gold">{visit.statusLabel}</p>
          <h1 className="mt-1 font-display text-3xl text-bone">Tu cita</h1>
          <p className="mt-1 text-sm text-bone/70">Hola, {visit.clientName}</p>

          <div className="mt-4 flex items-center gap-3">
            <img
              src={barberPortrait(visit.barber.slug)}
              alt=""
              className="h-16 w-16 rounded-full border border-gold/30 object-cover object-top"
            />
            <div>
              <p className="font-medium text-bone">
                {visit.barber.name}
                {visit.barber.nickname ? ` (${visit.barber.nickname})` : ""}
              </p>
              <p className="text-sm text-bone/70">{visit.service.name}</p>
            </div>
          </div>

          <ul className="mt-4 space-y-1 text-sm text-bone/85">
            <li className="capitalize">{formatDay(visit.startAt)}</li>
            <li>{formatSlotRange(visit.startAt, visit.service.durationMin)}</li>
            <li>
              <span className="font-semibold text-dorado">{formatMxn(visit.priceCents)}</span>
              {" · "}
              {visit.service.durationMin} min · {PAYMENT_NOTE}
            </li>
            <li className="text-bone/55">Tolerancia de llegada: {ARRIVAL_GRACE_MIN} min</li>
            {visit.notes ? <li className="text-bone/55">Nota: {visit.notes}</li> : null}
          </ul>

          <p className="mt-3 text-xs tracking-[0.18em] text-bone/50">Código {visit.code}</p>

          {visit.lockMessage ? (
            <p className="mt-4 rounded-xl border border-gold/30 bg-ink/50 px-3 py-3 text-sm text-bone/85">
              {visit.lockMessage}
              {visit.status === "CANCELLED" && visit.cancellationFeeCents > 0
                ? ` Cargo en el local: ${formatMxn(visit.cancellationFeeCents)}.`
                : ""}
            </p>
          ) : null}

          {error && visit ? <p className="mt-3 text-sm text-brick-soft">{error}</p> : null}

          {visit.canManage && !editing ? (
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button type="button" className="btn-gold !min-h-12 !rounded-xl" disabled={busy} onClick={() => void openEditor()}>
                Cambiar horario
              </button>
              <button
                type="button"
                className="btn-ghost !min-h-12 !rounded-xl border-brick-soft/50 text-brick-soft"
                disabled={busy}
                onClick={() => void cancelVisit()}
              >
                Cancelar cita
              </button>
            </div>
          ) : null}

          {editing ? (
            <div className="mt-5 space-y-4 border-t border-brick/30 pt-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-bone">Nuevo horario</h2>
                <button type="button" className="text-sm text-bone/60 underline-offset-2 hover:underline" onClick={() => setEditing(false)}>
                  Cerrar
                </button>
              </div>
              <p className="text-xs text-bone/55">Todos los días 9:00–20:00. El servicio no cambia.</p>
              <div className="grid grid-cols-3 gap-2">
                {barbers.map((barber) => {
                  const selected = barber.id === barberId;
                  return (
                    <button
                      key={barber.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setBarberId(barber.id)}
                      className={`overflow-hidden rounded-xl border text-left ${
                        selected ? "border-gold bg-bone text-ink" : "border-brick/35 text-bone"
                      }`}
                    >
                      <img
                        src={barberPortrait(barber.slug)}
                        alt=""
                        className="h-20 w-full object-cover object-top"
                      />
                      <span className="block px-2 py-1.5 text-xs font-medium">{barber.name.split(" ")[0]}</span>
                    </button>
                  );
                })}
              </div>
              <DateCalendar value={date} minDate={todayInMexicoCity()} onChange={setDate} />
              {slotsLoading ? <p className="text-sm text-bone/60">Buscando horarios…</p> : null}
              {!slotsLoading && date && slots.length === 0 ? (
                <p className="rounded-lg border border-brick-soft/40 bg-brick/15 p-3 text-sm text-brick-soft">
                  No hay horarios libres ese día. Prueba otra fecha o otro barbero.
                </p>
              ) : null}
              <div className="grid grid-cols-2 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    disabled={busy}
                    onClick={() => void chooseSlot(slot)}
                    className="min-h-[3.25rem] rounded-xl border border-brick/35 px-2 py-2.5 text-sm text-bone active:bg-bone active:font-semibold active:text-ink"
                  >
                    {formatSlotRange(slot, visit.service.durationMin)}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {visit.others.length > 0 ? (
            <div className="mt-6 border-t border-brick/30 pt-4">
              <h2 className="text-sm font-medium text-bone">Tus otras citas</h2>
              <ul className="mt-2 space-y-2">
                {visit.others.map((other) => (
                  <li key={other.token}>
                    <Link
                      href={`/cita/${other.token}`}
                      className="block rounded-xl border border-brick/30 px-3 py-3 text-sm text-bone hover:border-gold/40"
                    >
                      <span className="capitalize">{formatDay(other.startAt)}</span>
                      {" · "}
                      {formatTime(other.startAt)} · {other.serviceName} con {other.barberName}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </article>
      ) : null}
    </Shell>
  );
}
