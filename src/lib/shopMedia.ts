export type MediaCategory =
  | "cortes"
  | "barba"
  | "cabello"
  | "facial"
  | "recomendaciones"
  | "generales"
  | "local";

export type ShopMedia = {
  src: string;
  alt: string;
  title: string;
  category: MediaCategory;
  kind: "image" | "video";
};

const img = (
  category: MediaCategory,
  file: string,
  title: string,
  alt: string,
): ShopMedia => ({
  src: `/media/${category}/${file}`,
  alt,
  title,
  category,
  kind: "image",
});

const vid = (
  category: MediaCategory,
  file: string,
  title: string,
  alt: string,
): ShopMedia => ({
  src: `/media/${category}/${file}`,
  alt,
  title,
  category,
  kind: "video",
});

export const GALLERY: ShopMedia[] = [
  img("cortes", "IMG-20260930-WA0006.jpg", "Corte de niño", "Fade en niño, capa de barbería"),
  img("cortes", "IMG-20260930-WA0011.jpg", "Corte en proceso", "Barbero cortando a un niño"),
  img("cortes", "IMG-20260930-WA0013.jpg", "Corte y barba", "Cliente con sombrero después del corte"),
  img("cortes", "IMG-20260930-WA0015.jpg", "Fade y barba", "Perfil con fade y barba"),
  img("cortes", "IMG-20260930-WA0017.jpg", "Corte terminado", "Cliente y barbero en la silla"),
  vid("cortes", "VID-20260930-WA0035.mp4", "Video de corte", "Video de corte de cabello"),

  img("barba", "IMG-20260930-WA0044.jpg", "Aceite de barba", "Caja Salerm Homme Bo beard oil, 30 ml"),
  img("barba", "IMG-20260930-WA0021.jpg", "Aceite en uso", "Gotero de aceite de barba"),
  img("barba", "IMG-20260930-WA0003.jpg", "Perfilado de barba", "Toalla caliente y perfilado de barba"),
  img("barba", "IMG-20260930-WA0028.jpg", "Bigote y perilla", "Bigote con perilla corta"),
  img("barba", "IMG-20260930-WA0012.jpg", "Barba corta", "Barba corta y cabello peinado"),
  img("barba", "IMG-20260930-WA0022.jpg", "Barba completa", "Barba completa y cabello recogido"),
  img("barba", "IMG-20260930-WA0033.jpg", "Barba y fade", "Barba completa con fade"),
  img("barba", "IMG-20260930-WA0016.jpg", "Detalle de barba", "Barba y degradado bajo"),
  img("barba", "IMG-20260930-WA0005.jpg", "Barba tupida", "Retrato con barba completa"),
  img("barba", "IMG-20260930-WA0009.jpg", "Perilla y fade", "Perilla con fade alto"),
  img("barba", "IMG-20260930-WA0039.jpg", "Bigote marcado", "Bigote y barba ligera"),
  img("barba", "IMG-20260930-WA0047.jpg", "Línea de barba", "Perfil de bigote y barba"),
  img("barba", "IMG-20260930-WA0010.jpg", "Barba corta", "Barba corta y lentes"),
  img("barba", "IMG-20260930-WA0014.jpg", "Fade y barba", "Perfil de fade con barba corta"),
  img("barba", "IMG-20260930-WA0019.jpg", "Degradado", "Degradado y barba corta"),
  vid("barba", "VID-20260930-WA0020.mp4", "Video de barba", "Video del servicio de barba"),
  vid("barba", "VID-20260930-WA0018.mp4", "Video de barba", "Video enviado con el álbum de barba"),

  img("cabello", "IMG-20260930-WA0023.jpg", "Champú de cabello", "Champú exfoliante Salerm Homme"),
  img("cabello", "IMG-20260930-WA0004.jpg", "Lavado de cabello", "Lavado en el lavabo con el logo"),
  img("cabello", "IMG-20260930-WA0026.jpg", "Champú en el cabello", "Aplicación de champú"),
  img("cabello", "IMG-20260930-WA0030.jpg", "Masaje capilar", "Masaje con espuma"),
  img("cabello", "IMG-20260930-WA0032.jpg", "Enjuague", "Enjuague en el lavabo"),
  img("cabello", "IMG-20260930-WA0037.jpg", "Lavado", "Lavado frente al logo dorado"),
  img("cabello", "IMG-20260930-WA0043.jpg", "Lavado y masaje", "Masaje en el lavabo"),

  img("facial", "IMG-20260930-WA0046.jpg", "Vaporizador facial", "Vapor facial en la silla"),
  vid("facial", "VID-20260930-WA0018.mp4", "Video facial", "Video del vaporizador facial"),

  vid("recomendaciones", "VID-20260930-WA0024.mp4", "Recomendación", "Video de recomendación"),
  vid("recomendaciones", "VID-20260930-WA0040.mp4", "Recomendación", "Video de recomendación"),
  img("recomendaciones", "IMG-20260930-WA0045.jpg", "Visita en el local", "Foto de recomendación en la barbería"),
  img("recomendaciones", "IMG-20260930-WA0008.jpg", "En la silla", "Foto de recomendación junto al barbero"),

  img("generales", "IMG-20260930-WA0007.jpg", "Corte con sombrero", "Barbero cortando frente al ladrillo"),
  img("generales", "IMG-20260930-WA0025.jpg", "En la barbería", "Foto general dentro del local"),
  img("generales", "IMG-20260930-WA0027.jpg", "Foto general", "Foto general de El Calentano"),
  img("generales", "IMG-20260930-WA0029.jpg", "Foto general", "Foto general de El Calentano"),
  img("generales", "IMG-20260930-WA0031.jpg", "Foto general", "Foto general de El Calentano"),
  img("generales", "IMG-20260930-WA0034.jpg", "Foto general", "Foto general de El Calentano"),
  img("generales", "IMG-20260930-WA0036.jpg", "Foto general", "Foto general de El Calentano"),
  img("generales", "IMG-20260930-WA0038.jpg", "Foto general", "Foto general de El Calentano"),
  img("generales", "IMG-20260930-WA0041.jpg", "Foto general", "Foto general de El Calentano"),

  img("local", "IMG-20260930-WA0042.jpg", "Fachada", "Grupo frente a la barbería en Miguel Hidalgo"),
];

export const PRODUCTS = [
  {
    src: "/media/barba/IMG-20260930-WA0044.jpg",
    title: "Aceite de barba",
    detail: "Salerm Homme · Bo beard oil · 30 ml",
    alt: "Caja de aceite de barba Salerm sobre ladrillo",
  },
  {
    src: "/media/barba/IMG-20260930-WA0021.jpg",
    title: "Aceite en uso",
    detail: "Gotero de aceite para la barba",
    alt: "Gotero de aceite de barba en guante negro",
  },
  {
    src: "/media/cabello/IMG-20260930-WA0023.jpg",
    title: "Champú de cabello",
    detail: "Salerm Homme · champú exfoliante",
    alt: "Tubo negro de champú Salerm Homme",
  },
] as const;

export const IDENTITY = {
  src: "/media/identidad/IMG-20260930-WA0061.jpg",
  alt: "Collage de Arcelia: letras, iguana, quiosco, sombrero y ganado",
  title: "Arcelia, Guerrero",
};
