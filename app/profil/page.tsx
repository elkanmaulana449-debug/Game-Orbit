// app/profil/page.tsx
import { AppShell } from "@/app/store/shell";
import { ProfilContent } from "./profil-content";

export const metadata = { title: "Profil pengguna • Game Orbit" };

export default function ProfilPage() {
  return (
    <AppShell>
      <ProfilContent />
    </AppShell>
  );
}
