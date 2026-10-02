"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type BarberRow = {
  id: string;
  name: string;
  nickname: string | null;
  phone: string | null;
  active: boolean;
};

export function AdminTeam() {
  const [rows, setRows] = useState<BarberRow[]>([]);
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await api.getAdminBarbers();
    setRows(res.data);
  }

  useEffect(() => {
    void load().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "No se pudo cargar el equipo.");
    });
  }, []);

  return (
    <div className="mt-6 space-y-5">
      <form
        className="rounded-xl border border-white/10 bg-charcoal/80 p-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          setSaving(true);
          try {
            await api.createBarber({
              name,
              nickname: nickname.trim() || undefined,
              phone: phone.trim() || undefined,
            });
            setName("");
            setNickname("");
            setPhone("");
            await load();
          } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo agregar el barbero.");
          } finally {
            setSaving(false);
          }
        }}
      >
        <h2 className="text-lg font-semibold text-bone">Agregar barbero</h2>
        <p className="mt-1 text-sm text-bone/55">
          Aparece en la reserva. La foto se puede poner después en la carpeta de barberos.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="text-sm">
            Nombre
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-ink px-3 py-2"
            />
          </label>
          <label className="text-sm">
            Apodo
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/15 bg-ink px-3 py-2"
            />
          </label>
          <label className="text-sm">
            WhatsApp
            <input
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10 dígitos"
              className="mt-1 w-full rounded-xl border border-white/15 bg-ink px-3 py-2"
            />
          </label>
        </div>
        {error ? <p className="mt-3 text-sm text-brick-soft">{error}</p> : null}
        <button type="submit" disabled={saving} className="btn-gold mt-4 !min-h-11 !rounded-xl">
          {saving ? "Guardando…" : "Agregar a la barbería"}
        </button>
      </form>

      <ul className="space-y-2">
        {rows.map((barber) => (
          <li
            key={barber.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-ink/50 px-4 py-3"
          >
            <div>
              <p className="font-medium text-bone">
                {barber.name}
                {barber.nickname ? ` · ${barber.nickname}` : ""}
              </p>
              <p className="text-xs text-bone/50">{barber.phone ?? "Sin WhatsApp"}</p>
            </div>
            <p className="text-xs uppercase tracking-wider text-bone/45">
              {barber.active ? "Activo" : "Inactivo"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
