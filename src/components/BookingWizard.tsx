"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
import { FloatingField } from "@/components/motion/FloatingField";
import { BarberPick, barberPortrait } from "@/components/BarberPick";
import { MotionButton } from "@/components/motion/MotionButton";
import { easeOut, mobileTransition, useIsMobile } from "@/lib/motion";
import { FRESH_BOOKING_EVENT, requestFreshBooking } from "@/lib/bookingReset";

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
    <div className="rounded-xl border border-brick/40 bg-ink/60 p-2 sm:p-4">
      <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3">
        <button
          type="button"
          className="tap-target flex items-center justify-center rounded-xl border border-brick/40 text-lg text-gold disabled:opacity-30"
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
          className="tap-target flex items-center justify-center rounded-xl border border-brick/40 text-lg text-gold"
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
      <div className="mt-1 grid grid-cols-7 gap-1 sm:mt-2">
        {cells.map((cell) =>
          cell.day == null ? (
            <span key={cell.key} className="aspect-square min-h-11" />
          ) : (
            <button
              key={cell.key}
              type="button"
              disabled={cell.disabled}
              onClick={() => onChange(cell.key)}
              className={`flex aspect-square min-h-11 items-center justify-center rounded-lg text-sm transition active:scale-95 ${
                cell.selected
                  ? "bg-bone font-semibold text-ink"
                  : cell.disabled
                    ? "cursor-not-allowed text-bone/25"
                    : "text-bone active:bg-brick/40"
              }`}
            >
              {cell.day}
            </button>
          ),
        )}
      </div>
      <p className="mt-2 text-[11px] text-bone/50 sm:mt-3 sm:text-xs">
        Solo fechas de hoy en adelante.
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
  const mobile = useIsMobile();
  const stepMotion = mobile ? mobileTransition : { duration: 0.28, ease: easeOut };
  const successRef = useRef(false);
  successRef.current = success;

  function resetBooking() {
    setSuccess(false);
    setStep(1);
    setServiceId("");
    setBarberId("");
    setQuantity(1);
    setDate("");
    setSlots([]);
    setSlotDurationMin(0);
    setSlotNote(undefined);
    setStartAt("");
    setClientName("");
    setClientPhone("");
    setClientEmail("");
    setNotes("");
    setFieldErrors({});
    setError("");
    setWaitlistMode(false);
    setLoading(false);
  }

  useEffect(() => {
    const onFresh = () => {
      if (!successRef.current) return;
      resetBooking();
    };
    window.addEventListener(FRESH_BOOKING_EVENT, onFresh);
    return () => window.removeEventListener(FRESH_BOOKING_EVENT, onFresh);
  }, []);

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
      next.clientPhone =
        clientPhone.replace(/\D/g, "").length === 0
          ? "Escribe tu WhatsApp (10 dígitos)."
          : `Debe tener exactamente 10 dígitos (llevas ${clientPhone.replace(/\D/g, "").length}).`;
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

  function onPhoneChange(raw: string) {
    // Solo dígitos, máximo 10 (WhatsApp MX)
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    setClientPhone(digits);
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (!digits) {
        next.clientPhone = "Escribe tu WhatsApp (10 dígitos).";
      } else if (digits.length < 10) {
        next.clientPhone = `Faltan ${10 - digits.length} dígito${10 - digits.length === 1 ? "" : "s"} (${digits.length}/10).`;
      } else if (!isValidMxPhone(digits)) {
        next.clientPhone = "WhatsApp inválido. Usa 10 dígitos, ej. 7226935654.";
      } else {
        delete next.clientPhone;
      }
      return next;
    });
  }

  function onEmailChange(raw: string) {
    setClientEmail(raw);
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (!isValidOptionalEmail(raw)) {
        next.clientEmail = "Email inválido.";
      } else {
        delete next.clientEmail;
      }
      return next;
    });
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
      <motion.div
        className="panel p-5 text-center sm:p-8"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: easeOut }}
      >
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-bone/10">
          <svg viewBox="0 0 48 48" className="h-10 w-10 text-gold" aria-hidden>
            <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.35" />
            <path
              className="success-check"
              d="M14 25 L21 32 L34 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="font-display text-3xl text-gold">¡Listo!</p>
        <p className="mt-3 text-sm text-bone/90 sm:text-base">
          {waitlistMode
            ? "Quedaste en lista de espera. Te contactamos si se libera un horario."
            : "Tu cita quedó agendada. El pago se realiza en el local (MXN)."}
        </p>
        <p className="mt-2 text-sm text-bone/70">
          {selectedService?.name} con {selectedBarber?.name}
          {selectedBarber?.nickname ? ` (${selectedBarber.nickname})` : ""} —{" "}
          {startAt && selectedService
            ? formatSlotRange(
                startAt,
                selectedService.durationMin *
                  (selectedService.allowsQuantity ? quantity : 1),
              )
            : date}
        </p>
        {selectedService ? (
          <p className="mt-2 text-sm text-gold">
            {formatMxn(
              selectedService.priceCents *
                (selectedService.allowsQuantity ? quantity : 1),
            )}{" "}
            · {selectedService.durationMin * (selectedService.allowsQuantity ? quantity : 1)} min
            · tolerancia 5 min
          </p>
        ) : null}
        {notes.trim() ? (
          <p className="mt-2 text-xs text-bone/55">Nota: {notes.trim()}</p>
        ) : null}
        <button
          type="button"
          className="btn-gold mt-6 inline-flex w-full sm:w-auto animate-gold-pulse"
          onClick={() => {
            resetBooking();
            requestFreshBooking("top");
          }}
        >
          Volver al inicio
        </button>
      </motion.div>
    );
  }

  const durationMin =
    (selectedService?.durationMin ?? 0) *
    (selectedService?.allowsQuantity ? quantity : 1);
  const priceCents =
    (selectedService?.priceCents ?? 0) *
    (selectedService?.allowsQuantity ? quantity : 1);

  return (
    <div className="panel animate-fade-up p-3 sm:p-8">
      <div className="mb-3 rounded-xl border border-gold/30 bg-ink/55 p-3 sm:mb-4 sm:p-3.5">
        <p className="text-[11px] uppercase tracking-[0.16em] text-gold">Tu reserva</p>
        <ul className="mt-2 space-y-1 text-sm text-bone/80">
          <li>
            <span className="text-bone/45">Servicio: </span>
            {selectedService
              ? `${selectedService.name}${
                  selectedService.allowsQuantity ? ` ×${quantity}` : ""
                }`
              : "— elige en el paso 1"}
          </li>
          <li className="flex items-center gap-2">
            <span className="text-bone/45">Barbero: </span>
            {selectedBarber ? (
              <>
                <img
                  src={barberPortrait(selectedBarber.slug)}
                  alt=""
                  className="h-7 w-7 rounded-full object-cover"
                />
                <span>
                  {selectedBarber.name}
                  {selectedBarber.nickname ? ` (${selectedBarber.nickname})` : ""}
                </span>
              </>
            ) : (
              "— elige en el paso 2"
            )}
          </li>
          <li>
            <span className="text-bone/45">Fecha: </span>
            {date || "— elige en el paso 3"}
          </li>
          <li>
            <span className="text-bone/45">Horario: </span>
            {waitlistMode
              ? "Lista de espera"
              : startAt && durationMin
                ? `${formatSlotRange(startAt, durationMin)}`
                : "— elige horario"}
          </li>
          {selectedService ? (
            <>
              <li>
                <span className="text-bone/45">Duración: </span>
                {durationMin} min · tolerancia de llegada 5 min
              </li>
              <li className="pt-1 font-medium text-gold">
                Total estimado: {formatMxn(priceCents)} · pago en el local
              </li>
            </>
          ) : null}
        </ul>
      </div>

      <div className="mb-3 sm:mb-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs text-bone/55">
            Paso {Math.min(step, 4)} de 4 · {STEP_LABELS[Math.min(step, 4) - 1]}
          </p>
          {step > 1 ? (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-brick/40 px-3 text-sm text-gold active:bg-brick/30"
              aria-label="Volver al paso anterior"
            >
              ← Atrás
            </button>
          ) : null}
        </div>
        <div className="mb-3 grid grid-cols-4 gap-1.5" aria-hidden>
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className={`h-1.5 rounded-full transition ${
                n <= step ? "bg-bone" : "bg-bone/15"
              }`}
            />
          ))}
        </div>
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
                className={`min-h-10 shrink-0 rounded-xl px-3 py-2 text-xs uppercase tracking-[0.06em] transition ${
                  active
                    ? "bg-bone font-semibold text-ink"
                    : reachable
                      ? "bg-brick/35 text-bone"
                      : "cursor-not-allowed bg-white/5 text-bone/30"
                }`}
                title={STEP_LABELS[n - 1]}
              >
                {n}. {STEP_LABELS[n - 1]}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <motion.div
          role="alert"
          className="mb-4 animate-shake rounded-lg border border-brick-soft/60 bg-brick/25 px-4 py-3 text-sm text-bone"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.section
            key="step-1"
            initial={{ opacity: 0, x: mobile ? 10 : 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mobile ? -8 : -12 }}
            transition={stepMotion}
          >
          <h2 className="text-base font-semibold text-bone sm:text-xl">Elige tu servicio</h2>
          <p className="mt-1 text-sm text-bone/60">Toca uno para continuar · MXN</p>
          <ul className="mt-3 space-y-2 sm:mt-5 sm:space-y-3">
            {services.map((s) => (
              <li key={s.id}>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setServiceId(s.id);
                    setQuantity(1);
                    setStep(2);
                  }}
                  className={`flex min-h-[3.5rem] w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-3.5 text-left transition sm:px-4 ${
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
                </motion.button>
              </li>
            ))}
          </ul>
          </motion.section>
        )}

        {step === 2 && (
          <motion.section
            key="step-2"
            initial={{ opacity: 0, x: mobile ? 10 : 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mobile ? -8 : -12 }}
            transition={stepMotion}
          >
          <h2 className="text-base font-semibold sm:text-xl">Elige tu barbero</h2>
          <p className="mt-1 text-xs text-bone/55">Toca el retrato para continuar.</p>
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
          <div className="mt-4">
            <BarberPick
              barbers={barbers}
              value={barberId}
              onChange={(id) => {
                setBarberId(id);
                setStep(3);
              }}
            />
          </div>
          </motion.section>
        )}

        {step === 3 && (
          <motion.section
            key="step-3"
            initial={{ opacity: 0, x: mobile ? 10 : 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mobile ? -8 : -12 }}
            transition={stepMotion}
          >
          <h2 className="text-base font-semibold sm:text-xl">Fecha y hora</h2>
          <p className="mt-1 text-xs text-bone/60 sm:text-sm">
            Todos los días 9:00–20:00
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
          <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4">
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
                  className={`min-h-[3.25rem] rounded-xl border px-2 py-2.5 text-sm font-medium transition active:scale-[0.98] ${
                    past
                      ? "cursor-not-allowed border-white/5 text-bone/25"
                      : startAt === slot
                        ? "border-gold bg-bone font-semibold text-ink"
                        : "border-brick/35 active:bg-brick/25"
                  }`}
                >
                  {duration ? formatSlotRange(slot, duration) : formatTime(slot)}
                </button>
              );
            })}
          </div>
          </motion.section>
        )}

        {step === 4 && (
          <motion.section
            key="step-4"
            initial={{ opacity: 0, x: mobile ? 10 : 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mobile ? -8 : -12 }}
            transition={stepMotion}
          >
          <h2 className="text-base font-semibold sm:text-xl">
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
            <FloatingField
              id="clientName"
              label="Nombre completo"
              required
              autoComplete="name"
              value={clientName}
              onChange={setClientName}
              error={fieldErrors.clientName}
            />
            <FloatingField
              id="clientPhone"
              label="WhatsApp (10 dígitos)"
              required
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              pattern="[0-9]{10}"
              value={clientPhone}
              onChange={onPhoneChange}
              error={fieldErrors.clientPhone}
            />
            <p className="text-right text-[11px] text-bone/40">
              {clientPhone.length}/10
              {isValidMxPhone(clientPhone) ? (
                <span className="ml-2 text-gold">Listo</span>
              ) : null}
            </p>
            <FloatingField
              id="clientEmail"
              label="Email (opcional)"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={clientEmail}
              onChange={onEmailChange}
              error={fieldErrors.clientEmail}
            />
            <FloatingField
              id="notes"
              as="textarea"
              label="Nota o comentario (opcional)"
              maxLength={500}
              value={notes}
              onChange={setNotes}
              error={fieldErrors.notes}
            />
            <p className="text-right text-[11px] text-bone/40">{notes.length}/500</p>
          </div>
          <p className="mt-3 text-xs text-bone/50">
            Pagas en el local (MXN). Cancela con 24h; si es tarde aplica 50%.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:flex-wrap sm:gap-3">
            <MotionButton
              type="button"
              disabled={loading || !isValidMxPhone(clientPhone) || !isValidPersonName(clientName)}
              loading={loading}
              onClick={confirm}
              className="w-full !min-h-[3.25rem] !rounded-xl !text-base animate-gold-pulse sm:w-auto"
            >
              {loading
                ? "Enviando…"
                : waitlistMode
                  ? "Entrar a lista de espera"
                  : "Confirmar cita"}
            </MotionButton>
            <button
              type="button"
              onClick={goBack}
              className="btn-ghost w-full !rounded-xl sm:w-auto"
            >
              ← Atrás
            </button>
          </div>
          </motion.section>
        )}
      </AnimatePresence>
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
