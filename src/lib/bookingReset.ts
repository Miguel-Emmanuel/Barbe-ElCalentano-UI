/** Fired when the user wants to leave the success screen and start clean. */
export const FRESH_BOOKING_EVENT = "calentano:fresh-booking";

export function requestFreshBooking(scrollTo: "top" | "reservar" = "reservar") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(FRESH_BOOKING_EVENT));
  if (scrollTo === "top") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  document.getElementById("reservar")?.scrollIntoView({ behavior: "smooth", block: "start" });
}
