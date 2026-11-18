// app/chat/page.tsx
// Halaman chat user — mengikuti frame Figma "User · Chat global dan personal".
import type { Metadata } from "next";
import { AppShell } from "@/app/store/shell";
import { ChatApp } from "./chat-app";

export const metadata: Metadata = {
  title: "Chat · Game Orbit",
};

export default function ChatPage() {
  return (
    <AppShell>
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-bold text-[#6d4aff]">
          KOMUNITAS Game Orbit
        </p>
        <h1 className="text-[24px] font-bold leading-tight sm:text-[30px]">
          Tempat cerita bertemu.
        </h1>
        <p className="text-[13px] text-[#70758a]">
          Ngobrol di global atau lanjutkan percakapan secara personal.
        </p>
      </div>

      <ChatApp />
    </AppShell>
  );
}
