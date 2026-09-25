import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

/** Brand script: Cream Cake (Ef Studio) — use for “Calentano / EL CALENTANO”. */
const creamCake = localFont({
  src: [
    {
      path: "../fonts/CreamCake.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/CreamCake-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Barber Shop EL CALENTANO | Metepec",
  description:
    "Reserva tu cita en Barber Shop EL CALENTANO. Cortes, barba y faciales en Metepec, Edomex. Pago en el local.",
  applicationName: "EL CALENTANO",
  appleWebApp: {
    capable: true,
    title: "EL CALENTANO",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#14110F",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX">
      <body className={`${creamCake.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
