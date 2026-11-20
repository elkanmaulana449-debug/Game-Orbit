// app/dashboard/grafik.tsx
import { formatTanggal } from "@/app/workspace/ui";

// Grafik batang unduhan per hari. Batang terakhir (hari ini) berwarna ungu tua.
export function GrafikUnduhan({
  data,
  tinggi = 91,
}: {
  data: { tanggal: string; jumlah: number }[];
  tinggi?: number;
}) {
  const maks = Math.max(1, ...data.map((d) => d.jumlah));
  const rapat = data.length > 10;
  return (
    <div
      className="flex items-end gap-[6px] px-2 sm:gap-[25px] sm:px-4"
      style={{ height: tinggi + 22, gap: rapat ? 4 : undefined }}
    >
      {data.map((d, i) => {
        const terakhir = i === data.length - 1;
        const label = new Date(d.tanggal).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
        });
        return (
          <div
            key={d.tanggal}
            className="flex min-w-0 flex-1 flex-col items-center justify-end gap-[7px]"
            style={{ height: tinggi + 22 }}
            title={`${formatTanggal(d.tanggal)}: ${d.jumlah} unduhan`}
          >
            <div
              className={`w-full rounded-t-[5px] ${terakhir ? "bg-[#6d4aff]" : "bg-[#cebdff]"}`}
              style={{ height: Math.max(4, Math.round((d.jumlah / maks) * (tinggi - 21))) }}
            />
            {(!rapat || i % 5 === 0 || terakhir) && (
              <span className="whitespace-nowrap text-[9px]">{label}</span>
            )}
            {rapat && !(i % 5 === 0 || terakhir) && <span className="h-[11px]" />}
          </div>
        );
      })}
    </div>
  );
}
