export const ARRIVAL_GRACE_MIN = 10;

export const PAYMENT_METHODS = ["Efectivo", "Tarjeta", "Transferencia"] as const;

export const PAYMENT_NOTE = "Efectivo, tarjeta o transferencia. Pago en el local.";

export const SOCIAL = [
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/barber_elcalentano",
  },
  {
    id: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/share/1DxJzqFV6D/",
  },
  {
    id: "tiktok",
    label: "TikTok",
    href: "https://www.tiktok.com/@barber_elcalentano",
  },
] as const;
