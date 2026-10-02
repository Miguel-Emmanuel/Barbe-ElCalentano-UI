"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Block = {
  id: string;
  startMin: number;
  endMin: number;
  barber: { id: string; name: string } | null;
};

type BarberOption = { id: string; name: string };

function label(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const TIMES = Array.from({ length: ((20 * 60 - 9 * 60) / 10) + 1 }, (_, i) => 9 * 60 + i * 10);

export function AdminDeadHours({ date }: { date: string }) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [barbers, setBarbers] = useState<BarberOption[]>([]);
  const [barberId, setBarberId] = useState("");
  const [startMin, setStartMin] = useState(14 * 60);
  const [endMin, setEndMin] = useState(15 * 60);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load(day: string) {
    const [blocked, team] = await Promise.all([api.listBlocked(day), api.getAdminBarbers()]);
    setBlocks(blocked.data);
    setBarbers(team.data.map((b) => ({ id: b.id, name: b.name })));
  }

  useEffect(() => {
    void load(date).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los horarios.");
    });
  }, [date]);

  return (
    <div className="mt-6 space-y-5">
      <form
        className="rounded-xl border border-white/10 bg-charcoal/80 p-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          setSaving(true);
          try {
            await api.createBlocked({
              date,
              startMin,
              endMin,
              barberId: barberId || null,
            });
            await load(date);
          } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo cerrar ese horario.");
          } finally {
            setSaving(false);
          }
        }}
      >
        <h2 className="text-lg font-semibold text-bone">Horarios muertos</h2>
        <p className="mt-1 text-sm text-bone/55">
          Esos huecos dejan de aparecer en la reserva del {date}.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="text-sm">
            Silla
            <select
              value={barberId}
              onChange={(e) => setBarberId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-ink px-3 py-2"
            >
              <option value="">Todas las sillas</option>
              {barbers.map((barber) => (
                <option key={barber.id} value={barber.id}>
                  {barber.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Desde
            <select
              value={startMin}
              onChange={(e) => setStartMin(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-white/15 bg-ink px-3 py-2"
            >
              {TIMES.map((min) => (
                <option key={min} value={min}>
                  {label(min)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Hasta
            <select
              value={endMin}
              onChange={(e) => setEndMin(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-white/15 bg-ink px-3 py-2"
            >
              {TIMES.map((min) => (
                <option key={min} value={min}>
                  {label(min)}
                </option>
              ))}
            </select>
          </label>
        </div>
        {error ? <p className="mt-3 text-sm text-brick-soft">{error}</p> : null}
        <button type="submit" disabled={saving} className="btn-gold mt-4 !min-h-11 !rounded-xl">
          {saving ? "Cerrando…" : "Cerrar horario"}
        </button>
      </form>

      <ul className="space-y-2">
        {blocks.length === 0 ? (
          <li className="text-sm text-bone/55">Este día no tiene horarios cerrados.</li>
        ) : (
          blocks.map((block) => (
            <li
              key={block.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-ink/50 px-4 py-3"
            >
              <p className="text-sm text-bone">
                {label(block.startMin)}–{label(block.endMin)} · {block.barber?.name ?? "Todas las sillas"}
              </p>
              <button
                type="button"
                className="btn-ghost !min-h-10 !rounded-xl !px-3 !text-xs"
                onClick={async () => {
                  setError("");
                  try {
                    await api.deleteBlocked(block.id);
                    await load(date);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "No se pudo abrir el horario.");
                  }
                }}
              >
                Abrir
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
