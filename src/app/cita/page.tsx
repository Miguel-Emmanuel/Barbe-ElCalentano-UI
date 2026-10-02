"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { SiteHeader } from "@/components/SiteHeader";
import { normalizeMxPhone } from "@/lib/validation";

export default function FindCitaPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.lookupPublicAppointment(normalizeMxPhone(phone), code);
      router.push(`/cita/${res.data.token}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No encontramos esa cita.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-brick-wall bg-cover bg-center px-4 pb-16 pt-[calc(4.75rem+env(safe-area-inset-top))]">
        <form onSubmit={onSubmit} className="panel mx-auto w-full max-w-lg p-5 sm:p-7">
          <p className="text-[11px] uppercase tracking-[0.16em] text-gold">Ya tengo cita</p>
          <h1 className="mt-1 font-display text-3xl text-bone">Ver mi cita</h1>
          <p className="mt-2 text-sm text-bone/75">
            Escribe el WhatsApp con el que reservaste y el código de 6 caracteres.
          </p>
          <label className="mt-5 block text-sm text-bone/80">
            WhatsApp (10 dígitos)
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="numeric"
              autoComplete="tel"
              className="input-field mt-1 w-full"
              placeholder="7220000000"
            />
          </label>
          <label className="mt-3 block text-sm text-bone/80">
            Código de la cita
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              autoCapitalize="characters"
              className="input-field mt-1 w-full tracking-[0.2em]"
              placeholder="AB23CD"
            />
          </label>
          {error ? <p className="mt-3 text-sm text-brick-soft">{error}</p> : null}
          <button type="submit" className="btn-gold mt-5 w-full !min-h-12 !rounded-xl" disabled={loading}>
            {loading ? "Buscando…" : "Ver mi cita"}
          </button>
        </form>
      </main>
    </>
  );
}
