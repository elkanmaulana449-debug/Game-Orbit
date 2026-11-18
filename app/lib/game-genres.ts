export const GAME_GENRES = [
  "Aksi",
  "Petualangan",
  "RPG",
  "Strategi",
  "Simulasi",
  "Olahraga",
  "Balapan",
  "Santai",
  "Puzzle",
  "Horor",
  "Edukasi",
  "Lainnya",
] as const;

export type GameGenre = (typeof GAME_GENRES)[number];

export function isGameGenre(value: unknown): value is GameGenre {
  return typeof value === "string" && GAME_GENRES.some((genre) => genre === value);
}
