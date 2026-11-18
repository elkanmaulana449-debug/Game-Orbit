// app/koleksi/page.tsx
import { AppShell } from "@/app/store/shell";
import { KoleksiContent } from "./koleksi-content";

export const metadata = { title: "Koleksi saya • Game Orbit" };

export default function KoleksiPage() {
  return (
    <AppShell>
      <KoleksiContent />
    </AppShell>
  );
}
