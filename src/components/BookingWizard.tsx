"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  api,
  formatMxn,
  formatSlotRange,
  formatTime,
  type Barber,
  type Service,
} from "@/lib/api";
import {
  WEEKDAYS_ES,
  isValidMxPhone,
  isValidOptionalEmail,
  isValidPersonName,
  monthLabelEs,
  normalizeMxPhone,
  parseDateKey,
  toDateKey,
  todayInMexicoCity,
} from "@/lib/validation";

type Step = 1 | 2 | 3 | 4 | 5;

const STEP_LABELS = ["Servicio", "Barbero", "Fecha", "Datos"] as const;

function DateCalendar({
  value,
  minDate,
  onChange,
}: {
  value: string;
  minDate: string;
  onChange: (date: string) => void;
}) {
  const min = parseDateKey(minDate);
  const initial = value ? parseDateKey(value) : min;
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.monthIndex);

  useEffect(() => {
    if (!value) return;
    const parsed = parseDateKey(value);
    setViewYear(parsed.year);
    setViewMonth(parsed.monthIndex);
  }, [value]);

  const firstDow = new Date(Date.UTC(viewYear, viewMonth, 1)).getUTCDay();
  const mondayOffset = (firstDow + 6) % 7;
  const daysInMonth = new Date(Date.UTC(viewYear, viewMonth + 1, 0)).getUTCDate();

  const cells: Array<{ key: string; day: number | null; disabled: boolean; selected: boolean }> =
    [];

  for (let i = 0; i < mondayOffset; i += 1) {
    cells.push({ key: `e-${i}`, day: null, disabled: true, selected: false });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = toDateKey(viewYear, viewMonth, day);
    const disabled = key < minDate;
    cells.push({
      key,
      day,
      disabled,
      selected: value === key,
    });
  }

  function shiftMonth(delta: number) {
    const d = new Date(Date.UTC(viewYear, viewMonth + delta, 1));
    setViewYear(d.getUTCFullYear());
    setViewMonth(d.getUTCMonth());
  }

  const canGoPrev =
    viewYear > min.year || (viewYear === min.year && viewMonth > min.monthIndex);

  return (
    <div className="rounded-xl border border-brick/40 bg-ink/60 p-2.5 sm:p-4">
      <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3">
        <button
          type="button"
          className="tap-target flex items-center justify-center rounded-full border border-brick/40 text-lg text-gold disabled:opacity-30"
          onClick={() => shiftMonth(-1)}
          disabled={!canGoPrev}
          aria-label="Mes anterior"
        >
          ←
        </button>
        <p className="text-sm font-medium capitalize text-bone">
          {monthLabelEs(viewYear, viewMonth)}
        </p>
        <button
          type="button"
          className="tap-target flex items-center justify-center rounded-full border border-brick/40 text-lg text-gold"
          onClick={() => shiftMonth(1)}
          aria-label="Mes siguiente"
        >
          →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] uppercase tracking-wide text-bone/50 sm:gap-1 sm:text-[11px]">
        {WEEKDAYS_ES.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-0.5 sm:mt-2 sm:gap-1">
        {cells.map((cell) =>
          cell.day == null ? (
            <span key={cell.key} className="h-10 sm:h-9" />
          ) : (
            <button
              key={cell.key}
              type="button"
              disabled={cell.disabled}
              onClick={() => onChange(cell.key)}
              className={`flex h-10 items-center justify-center rounded-md text-sm transition active:scale-95 sm:h-9 ${
                cell.selected
                  ? "bg-gold font-semibold text-ink"
                  : cell.disabled
                    ? "cursor-not-allowed text-bone/25"
                    : "text-bone hover:bg-brick/40"
              }`}
            >
              {cell.day}
            </button>
          ),
        )}
      </div>
      <p className="mt-2 text-[11px] text-bone/50 sm:mt-3 sm:text-xs">
        Fechas pasadas no disponibles ({minDate}).
      </p>
    </div>
  );
}

export function BookingWizard() {
  const [step, setStep] = useState<Step>(1);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [barberId, setBarberId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [slotDurationMin, setSlotDurationMin] = useState(0);
  const [slotNote, setSlotNote] = useState<string | undefined>();
  const [startAt, setStartAt] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [bootError, setBootError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [waitlistMode, setWaitlistMode] = useState(false);

  const minDate = useMemo(() => todayInMexicoCity(), []);

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId),
    [services, serviceId],
  );
  const selectedBarber = useMemo(
    () => barbers.find((b) => b.id === barberId),
    [barbers, barberId],
  );

  const maxReached: Step = useMemo(() => {
    if (success) return 5;
    if (clientName && clientPhone && (startAt || waitlistMode) && date && barberId && serviceId)
      return 4;
    if (date && (startAt || waitlistMode) && barberId && serviceId) return 4;
    if (barberId && serviceId) return 3;
    if (serviceId) return 2;
    return 1;
  }, [serviceId, barberId, date, startAt, waitlistMode, clientName, clientPhone, success]);

  useEffect(() => {
    Promise.all([api.getServices(), api.getBarbers()])
      .then(([s, b]) => {
        setServices(s.data);
        setBarbers(b.data);
      })
      .catch((e: Error) => {
        setBootError(
          e.message ||
            "No pudimos cargar el catálogo. Verifica que la API esté encendida.",
        );
      });
  }, []);

  useEffect(() => {
    if (!date || !serviceId || !barberId) return;
    setLoading(true);
    setError("");
    api
      .getAvailability({
        date,
        serviceId,
        barberId,
        quantity: selectedService?.allowsQuantity ? quantity : 1,
      })
      .then((res) => {
        const now = Date.now();
        const available = res.data.slots.filter((slot) => new Date(slot).getTime() > now);
        setSlots(available);
        setSlotDurationMin(res.data.durationMin);
        setSlotNote(res.data.note);
        setStartAt("");
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [date, serviceId, barberId, quantity, selectedService?.allowsQuantity]);

  function goToStep(target: Step) {
    if (target === step) return;
    if (target > maxReached) return;
    if (target < step || target <= maxReached) {
      setError("");
      setStep(target);
    }
  }

  function goBack() {
    if (step <= 1) return;
    setError("");
    setStep((step - 1) as Step);
  }

  function validateClientFields() {
    const next: Record<string, string> = {};
    if (!isValidPersonName(clientName)) {
      next.clientName = "Escribe tu nombre completo (solo letras, mín. 2 caracteres).";
    }
    if (!isValidMxPhone(clientPhone)) {
      next.clientPhone = "Teléfono inválido. Usa 10 dígitos (México), ej. 7221234567.";
    }
    if (!isValidOptionalEmail(clientEmail)) {
      next.clientEmail = "Email inválido.";
    }
    if (notes.trim().length > 500) {
      next.notes = "La nota no puede pasar de 500 caracteres.";
    }
    if (!waitlistMode && !startAt) {
      next.startAt = "Selecciona un horario disponible.";
    }
    if (!date || date < minDate) {
      next.date = "Selecciona una fecha válida (hoy o posterior).";
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function confirm() {
    if (!validateClientFields()) {
      setError("Revisa los campos marcados.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const phone = normalizeMxPhone(clientPhone);
      const trimmedNotes = notes.trim() || undefined;
      if (waitlistMode || !startAt) {
        await api.joinWaitlist({
          date,
          serviceId,
          barberId,
          clientName: clientName.trim(),
          clientPhone: phone,
          notes: trimmedNotes,
        });
        setSuccess(true);
        setStep(5);
        return;
      }
      if (new Date(startAt).getTime() <= Date.now()) {
        setError("Ese horario ya pasó. Elige otro.");
        setStep(3);
        return;
      }
      await api.createAppointment({
        serviceId,
        barberId,
        startAt,
        clientName: clientName.trim(),
        clientPhone: phone,
        clientEmail: clientEmail.trim() || undefined,
        quantity: selectedService?.allowsQuantity ? quantity : 1,
        notes: trimmedNotes,
      });
      setSuccess(true);
      setStep(5);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo reservar.");
    } finally {
      setLoading(false);
    }
  }

  if (bootError) {
    return (
      <div className="panel p-6 text-bone">
        <p className="font-medium text-gold-soft">No se pudo iniciar la reserva</p>
        <p className="mt-2 text-sm text-bone/80">{bootError}</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="panel animate-fade-up p-5 text-center sm:p-8">
        <p className="font-display text-3xl text-gold">¡Listo!</p>
        <p className="mt-3 text-sm text-bone/90 sm:text-base">
          {waitlistMode
            ? "Quedaste en lista de espera. Te contactamos si se libera un horario."
            : "Tu cita quedó agendada. El pago se realiza en el local (MXN)."}
        </p>
        <p className="mt-2 text-sm text-bone/70">
          {selectedService?.name} con {selectedBarber?.name}
          {selectedBarber?.nickname ? ` (${selectedBarber.nickname})` : ""} —{" "}
          {startAt ? formatTime(startAt) : date}
        </p>
        {notes.trim() ? (
          <p className="mt-2 text-xs text-bone/55">Nota: {notes.trim()}</p>
        ) : null}
        <Link href="/" className="btn-gold mt-6 inline-flex w-full sm:w-auto animate-gold-pulse">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="panel animate-fade-up p-3.5 sm:p-8">
      <div className="mb-4 flex items-center gap-2 sm:mb-5">
        {step > 1 && (
          <button
            type="button"
            onClick={goBack}
            className="tap-target flex shrink-0 items-center justify-center rounded-full border border-brick/40 text-lg text-gold transition active:bg-brick/30"
            aria-label="Volver al paso anterior"
          >
            ←
          </button>
        )}
        <div className="chip-scroll flex-1">
          {[1, 2, 3, 4].map((n) => {
            const reachable = n <= maxReached || n <= step;
            const active = step === n;
            return (
              <button
                key={n}
                type="button"
                disabled={!reachable}
                onClick={() => goToStep(n as Step)}
                className={`shrink-0 rounded-full px-3 py-2 text-xs uppercase tracking-[0.08em] transition sm:tracking-[0.14em] ${
                  active
                    ? "bg-gold font-semibold text-ink"
                    : reachable
                      ? "bg-brick/35 text-bone"
                      : "cursor-not-allowed bg-white/5 text-bone/30"
                }`}
                title={STEP_LABELS[n - 1]}
              >
                <span className="sm:hidden">{n}</span>
                <span className="hidden sm:inline">
                  {n} · {STEP_LABELS[n - 1]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-brick-soft/60 bg-brick/25 px-4 py-3 text-sm text-bone"
        >
          {error}
        </div>
      )}

      {step === 1 && (
        <section>
          <h2 className="text-lg font-semibold text-bone sm:text-xl">Elige tu servicio</h2>
          <p className="mt-1 text-sm text-bone/60">Precios en MXN · pago en el local</p>
          <ul className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
            {services.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => {
                    setServiceId(s.id);
                    setQuantity(1);
                    setStep(2);
                  }}
                  className={`flex min-h-[3.25rem] w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-3.5 text-left transition active:scale-[0.99] sm:px-4 ${
                    serviceId === s.id
                      ? "border-gold bg-brick/30"
                      : "border-brick/30 bg-ink/40"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium sm:text-base">{s.name}</span>
                    <span className="text-xs text-bone/55">
                      {s.durationMin} min
                      {s.allowsQuantity ? " · por ceja" : ""}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-gold sm:text-base">
                    {formatMxn(s.priceCents)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {step === 2 && (
        <section>
          <h2 className="text-lg font-semibold sm:text-xl">Elige tu barbero</h2>
          {selectedService?.allowsQuantity && (
            <div className="mt-4 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:gap-3">
              <span>¿Cuántas cejas?</span>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="input-field sm:!w-auto"
              >
                <option value={1}>1 ceja — {formatMxn(2500)}</option>
                <option value={2}>2 cejas — {formatMxn(5000)}</option>
              </select>
            </div>
          )}
          <ul className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
            {barbers.map((b) => (
              <li key={b.id}>
                <button
                  type="button"
                  onClick={() => {
                    setBarberId(b.id);
                    setStep(3);
                  }}
                  className={`min-h-[3.25rem] w-full rounded-xl border px-3.5 py-3.5 text-left transition active:scale-[0.99] sm:px-4 ${
                    barberId === b.id
                      ? "border-gold bg-brick/30"
                      : "border-brick/30 bg-ink/40"
                  }`}
                >
                  <span className="font-medium">
                    {b.name}
                    {b.nickname ? <span className="text-gold"> — {b.nickname}</span> : null}
                  </span>
                  {b.specialties && (
                    <span className="mt-1 block text-xs text-bone/55">{b.specialties}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="btn-ghost mt-5 w-full sm:w-auto" onClick={goBack}>
            ← Volver
          </button>
        </section>
      )}

      {step === 3 && (
        <section>
          <h2 className="text-lg font-semibold sm:text-xl">Fecha y hora</h2>
          <p className="mt-1 text-xs text-bone/60 sm:text-sm">
            Lun–Sáb 10:00–20:00 · Dom por cita 11:00–16:00
          </p>
          <div className="mt-4">
            <DateCalendar
              value={date}
              minDate={minDate}
              onChange={(next) => {
                setDate(next);
                setWaitlistMode(false);
                setStartAt("");
              }}
            />
          </div>
          {fieldErrors.date && (
            <p className="mt-2 text-sm text-brick-soft">{fieldErrors.date}</p>
          )}
          {slotNote && <p className="mt-2 text-sm text-gold-soft">{slotNote}</p>}
          {loading && <p className="mt-4 text-sm text-bone/60">Buscando horarios…</p>}
          {!loading && date && slots.length > 0 && (
            <p className="mt-4 text-xs text-bone/55">
              {slotDurationMin || selectedService?.durationMin || "—"} min · inicio–fin
            </p>
          )}
          {!loading && date && slots.length === 0 && (
            <div className="mt-4 space-y-3 rounded-lg border border-brick-soft/40 bg-brick/15 p-4 text-sm">
              <p className="text-brick-soft">
                No hay horarios libres (o ya pasaron). Prueba otra fecha o lista de espera.
              </p>
              <button
                type="button"
                onClick={() => {
                  setWaitlistMode(true);
                  setStartAt("");
                  setStep(4);
                }}
                className="btn-ghost w-full border-gold/50 text-gold-soft sm:w-auto"
              >
                Unirme a lista de espera
              </button>
            </div>
          )}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {slots.map((slot) => {
              const past = new Date(slot).getTime() <= Date.now();
              const duration = slotDurationMin || selectedService?.durationMin || 0;
              return (
                <button
                  key={slot}
                  type="button"
                  disabled={past}
                  onClick={() => {
                    setStartAt(slot);
                    setWaitlistMode(false);
                    setStep(4);
                  }}
                  className={`min-h-12 rounded-xl border px-2 py-2.5 text-sm transition active:scale-[0.98] ${
                    past
                      ? "cursor-not-allowed border-white/5 text-bone/25"
                      : startAt === slot
                        ? "border-gold bg-gold font-semibold text-ink"
                        : "border-brick/35"
                  }`}
                >
                  {duration ? formatSlotRange(slot, duration) : formatTime(slot)}
                </button>
              );
            })}
          </div>
          <button type="button" className="btn-ghost mt-5 w-full sm:w-auto" onClick={goBack}>
            ← Volver
          </button>
        </section>
      )}

      {step === 4 && (
        <section>
          <h2 className="text-lg font-semibold sm:text-xl">
            {waitlistMode ? "Lista de espera" : "Tus datos"}
          </h2>
          <p className="mt-1 text-xs text-bone/60 sm:text-sm">
            {selectedService?.name} · {selectedBarber?.name}
            {!waitlistMode && startAt ? ` · ${formatTime(startAt)}` : ""}
            {waitlistMode && date ? ` · ${date}` : ""} ·{" "}
            {selectedService
              ? formatMxn(
                  selectedService.priceCents *
                    (selectedService.allowsQuantity ? quantity : 1),
                )
              : ""}
          </p>
          <div className="mt-5 space-y-3">
            <div>
              <label className="mb-1 block text-xs text-bone/55" htmlFor="clientName">
                Nombre completo *
              </label>
              <input
                id="clientName"
                required
                autoComplete="name"
                placeholder="Ej. Juan Pérez"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="input-field"
              />
              {fieldErrors.clientName && (
                <p className="mt-1 text-xs text-brick-soft">{fieldErrors.clientName}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs text-bone/55" htmlFor="clientPhone">
                WhatsApp (10 dígitos) *
              </label>
              <input
                id="clientPhone"
                required
                inputMode="tel"
                autoComplete="tel"
                placeholder="7221234567"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="input-field"
              />
              {fieldErrors.clientPhone && (
                <p className="mt-1 text-xs text-brick-soft">{fieldErrors.clientPhone}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs text-bone/55" htmlFor="clientEmail">
                Email (opcional)
              </label>
              <input
                id="clientEmail"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="correo@ejemplo.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="input-field"
              />
              {fieldErrors.clientEmail && (
                <p className="mt-1 text-xs text-brick-soft">{fieldErrors.clientEmail}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs text-bone/55" htmlFor="notes">
                Nota o comentario (opcional)
              </label>
              <textarea
                id="notes"
                rows={3}
                maxLength={500}
                placeholder="Ej. Preferencias del corte, vengo con niño…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-field min-h-[5.5rem] resize-y"
              />
              <p className="mt-1 text-right text-[11px] text-bone/40">{notes.length}/500</p>
              {fieldErrors.notes && (
                <p className="mt-1 text-xs text-brick-soft">{fieldErrors.notes}</p>
              )}
            </div>
          </div>
          <p className="mt-3 text-xs text-bone/50">
            Pagas en el local (MXN). Cancela con 24h; si es tarde aplica 50%.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:flex-wrap sm:gap-3">
            <button type="button" onClick={goBack} className="btn-ghost w-full sm:w-auto">
              ← Volver
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={confirm}
              className="btn-gold w-full animate-gold-pulse sm:w-auto"
            >
              {loading
                ? "Enviando…"
                : waitlistMode
                  ? "Entrar a lista de espera"
                  : "Confirmar cita"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

export function BrandMark({
  size = 160,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto inline-flex overflow-hidden rounded-2xl border border-gold/30 bg-ink shadow-panel ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/brand/logo-black.jpg"
        alt="Barber Shop El Calentano"
        width={size}
        height={size}
        className="h-full w-full object-cover"
        priority
        sizes="(max-width: 640px) 200px, 280px"
      />
    </div>
  );
}
