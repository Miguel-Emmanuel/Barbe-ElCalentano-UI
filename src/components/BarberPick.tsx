export function barberPortrait(slug: string) {
  return `/brand/barbers/${slug}.jpeg`;
}

export type BarberCard = {
  id: string;
  name: string;
  slug: string;
  nickname?: string | null;
  specialties?: string | null;
};

function plate(barber: BarberCard) {
  const [first, ...rest] = barber.name.split(" ");
  return {
    title: first || barber.name,
    caption: barber.nickname || rest.join(" "),
  };
}

export function BarberPick({
  barbers,
  value,
  onChange,
}: {
  barbers: BarberCard[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <ul className="grid grid-cols-3 gap-2 sm:gap-3">
      {barbers.map((barber) => {
        const selected = value === barber.id;
        const { title, caption } = plate(barber);
        return (
          <li key={barber.id}>
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(barber.id)}
              className={`w-full overflow-hidden rounded-2xl border-2 text-left transition duration-200 active:scale-[0.97] ${
                selected
                  ? "border-bone bg-charcoal shadow-panel"
                  : "border-white/10 bg-ink/50 hover:border-bone/45"
              }`}
            >
              <span className="relative block aspect-[3/4] overflow-hidden bg-charcoal">
                <img
                  src={barberPortrait(barber.slug)}
                  alt=""
                  className="h-full w-full object-cover object-top"
                />
                {selected ? (
                  <span className="absolute right-1.5 top-1.5 rounded-full bg-bone px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink">
                    Elegido
                  </span>
                ) : null}
              </span>
              <span className="block px-1.5 py-2 text-center sm:px-2">
                <span className="block truncate text-sm font-semibold text-bone">{title}</span>
                {caption ? (
                  <span className="block truncate text-[11px] text-gold">{caption}</span>
                ) : null}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
