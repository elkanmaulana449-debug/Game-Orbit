// app/chat/chat-app.tsx
// Isi halaman chat: daftar percakapan di kiri, dan di kanan hanya SATU panel:
// global chat (default) ATAU personal chat (saat sebuah percakapan dipilih).
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useStoreUser } from "@/app/store/client-parts";
import {
  ChevronLeftIcon,
  GlobeIcon,
  LockKeyholeIcon,
  PinIcon,
  SearchIcon,
  XIcon,
} from "@/app/store/icons";
import {
  Avatar,
  Balon,
  Composer,
  GalatMuat,
  KartuProfil,
  PemisahHari,
  getJson,
  jam,
  kelompokkanHari,
  postJson,
  useGulirKeBawah,
  useInterval,
  waktuRingkas,
} from "./chat-parts";
import type {
  Conversation,
  GlobalMsg,
  PersonalMsg,
  UserLite,
} from "./chat-parts";

type Aktif = { jenis: "global" } | { jenis: "personal"; user: UserLite };
type Filter = "semua" | "global" | "personal";

const TINGGI = "h-[min(704px,calc(100vh-14rem))] min-h-[480px]";

// ==========================================================
// Pintu masuk: cek dulu apakah user sudah login
// ==========================================================
export function ChatApp() {
  const me = useStoreUser();

  if (me === undefined) {
    return (
      <div
        className={`${TINGGI} animate-pulse rounded-[14px] border border-[#e4e6f0] bg-white`}
      />
    );
  }

  if (me === null) {
    return (
      <div className="rounded-[14px] border border-dashed border-[#e4e6f0] bg-white p-10 text-center text-[13px] text-[#70758a]">
        Kamu perlu masuk dulu untuk memakai chat.
        <div className="mt-3">
          <Link href="/login" className="font-semibold text-[#6d4aff]">
            Ke halaman masuk
          </Link>
        </div>
      </div>
    );
  }

  return <ChatRoom meId={me.id} />;
}

// ==========================================================
// Ruang chat
// ==========================================================
function ChatRoom({ meId }: { meId: string }) {
  const [aktif, setAktif] = useState<Aktif>({ jenis: "global" });
  const [tampilPane, setTampilPane] = useState(false); // khusus layar kecil
  const [filter, setFilter] = useState<Filter>("semua");
  const [cari, setCari] = useState("");

  const [percakapan, setPercakapan] = useState<Conversation[]>([]);
  const [globalMsgs, setGlobalMsgs] = useState<GlobalMsg[] | null>(null);
  const [statistik, setStatistik] = useState<{
    online: number;
    total: number;
  } | null>(null);

  const [gagalMuat, setGagalMuat] = useState(false);
  const globalRef = useRef<GlobalMsg[]>([]);
  useEffect(() => {
    globalRef.current = globalMsgs ?? [];
  }, [globalMsgs]);

  // ---------- Ambil data ----------
  const muatPercakapan = useCallback(async () => {
    const d = await getJson<{ conversations: Conversation[] }>(
      `/api/chat/conversations?me=${encodeURIComponent(meId)}`,
    );
    if (d) setPercakapan(d.conversations);
  }, [meId]);

  const muatGlobal = useCallback(async () => {
    const terakhir = globalRef.current[globalRef.current.length - 1]?.createdAt;
    const url = terakhir
      ? `/api/chat/global?setelah=${encodeURIComponent(terakhir)}`
      : "/api/chat/global";
    const d = await getJson<{ messages: GlobalMsg[] }>(url);
    if (!d) {
      setGagalMuat(true);
      return;
    }
    setGagalMuat(false);
    setGlobalMsgs((prev) => {
      const lama = prev ?? [];
      const ids = new Set(lama.map((m) => m.id));
      const baru = d.messages.filter((m) => !ids.has(m.id));
      // pertama kali dimuat: set walau kosong supaya tampilan "kosong" muncul
      if (prev === null || baru.length > 0) return [...lama, ...baru];
      return prev;
    });
  }, []);

  const muatStatistik = useCallback(async () => {
    const d = await getJson<{ online: number; total: number }>("/api/presence");
    if (d) setStatistik(d);
  }, []);

  const kirimHeartbeat = useCallback(() => {
    postJson("/api/presence", { userId: meId });
  }, [meId]);

  useEffect(() => {
    muatPercakapan();
    muatGlobal();
    muatStatistik();
    kirimHeartbeat();
  }, [muatPercakapan, muatGlobal, muatStatistik, kirimHeartbeat]);

  useInterval(muatGlobal, 3000);
  useInterval(muatPercakapan, 5000);
  useInterval(muatStatistik, 30000);
  useInterval(kirimHeartbeat, 60000);

  // ---------- Aksi ----------
  const kirimGlobal = async (teks: string) => {
    const d = await postJson<{ message: GlobalMsg }>("/api/chat/global", {
      senderId: meId,
      content: teks,
    });
    if (!d) return false;
    setGlobalMsgs((prev) =>
      prev?.some((m) => m.id === d.message.id)
        ? prev
        : [...(prev ?? []), d.message],
    );
    return true;
  };

  const bukaGlobal = () => {
    setAktif({ jenis: "global" });
    setTampilPane(true);
  };

  const bukaPersonal = (user: UserLite) => {
    setAktif({ jenis: "personal", user });
    setTampilPane(true);
  };

  // ---------- Susun daftar kiri ----------
  // Lawan bicara yang baru dipilih dari kartu profil (belum ada pesan) tetap
  // ditampilkan di atas daftar sampai pesan pertama terkirim.
  const daftarPersonal: Conversation[] =
    aktif.jenis === "personal" &&
    !percakapan.some((c) => c.user.id === aktif.user.id)
      ? [{ user: aktif.user, lastMessage: null, unread: 0 }, ...percakapan]
      : percakapan;

  const kata = cari.trim().toLowerCase();
  const tampilGlobal =
    filter !== "personal" && (!kata || "global game orbit".includes(kata));
  const tampilPersonal =
    filter === "global"
      ? []
      : daftarPersonal.filter(
          (c) => !kata || c.user.name.toLowerCase().includes(kata),
        );

  const pesanTerakhirGlobal = globalMsgs?.[globalMsgs.length - 1];

  return (
    <div
      className={`${TINGGI} flex overflow-hidden rounded-[14px] border border-[#e4e6f0] bg-white`}
    >
      {/* ===== Daftar percakapan ===== */}
      <div
        className={`${
          tampilPane ? "hidden md:flex" : "flex"
        } w-full shrink-0 flex-col border-r border-[#e4e6f0] md:w-[260px]`}
      >
        <div className="flex flex-col gap-[17px] p-[18px]">
          <p className="text-[17px]">Percakapan</p>

          <label className="flex h-[35px] items-center gap-2 rounded-[7px] bg-[#f5f6fa] px-[10px]">
            <SearchIcon size={14} className="shrink-0" />
            <input
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari percakapan..."
              className="min-w-0 flex-1 bg-transparent text-[10px] placeholder:text-[#22243a] focus:outline-none"
            />
          </label>

          <div className="flex gap-[14px] text-[11px]">
            {(
              [
                ["semua", "Semua"],
                ["global", "Global"],
                ["personal", "Personal"],
              ] as const
            ).map(([nilai, label]) => (
              <button
                key={nilai}
                type="button"
                onClick={() => setFilter(nilai)}
                className={
                  filter === nilai ? "font-semibold text-[#6d4aff]" : ""
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {tampilGlobal && (
            <ItemPercakapan
              terpilih={aktif.jenis === "global"}
              avatar={
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#6d4aff] text-white">
                  <GlobeIcon size={18} />
                </div>
              }
              nama="Global Game Orbit"
              waktu={
                pesanTerakhirGlobal
                  ? waktuRingkas(pesanTerakhirGlobal.createdAt)
                  : ""
              }
              pratinjau={
                pesanTerakhirGlobal
                  ? `${
                      pesanTerakhirGlobal.sender.id === meId
                        ? "Kamu"
                        : pesanTerakhirGlobal.sender.name.split(" ")[0]
                    }: ${pesanTerakhirGlobal.content}`
                  : "Belum ada pesan"
              }
              onClick={bukaGlobal}
            />
          )}

          {tampilPersonal.map((c) => {
            const terpilih =
              aktif.jenis === "personal" && aktif.user.id === c.user.id;
            return (
              <ItemPercakapan
                key={c.user.id}
                terpilih={terpilih}
                avatar={
                  <Avatar nama={c.user.name} size={36} online={c.user.online} />
                }
                nama={c.user.name}
                waktu={c.lastMessage ? waktuRingkas(c.lastMessage.createdAt) : ""}
                pratinjau={
                  c.lastMessage
                    ? `${c.lastMessage.dariSaya ? "Kamu: " : ""}${c.lastMessage.content}`
                    : "Belum ada pesan"
                }
                unread={terpilih ? 0 : c.unread}
                onClick={() => bukaPersonal(c.user)}
              />
            );
          })}

          {!tampilGlobal && tampilPersonal.length === 0 && (
            <p className="p-6 text-center text-[11px] text-[#70758a]">
              {kata
                ? "Tidak ada percakapan yang cocok."
                : "Belum ada percakapan personal. Klik nama seseorang di global chat untuk memulai."}
            </p>
          )}
        </div>

        <div className="flex items-center gap-[7px] p-4 text-[9px] text-[#70758a]">
          <LockKeyholeIcon size={12} className="shrink-0" />
          Ruang aman untuk semua pemain.
        </div>
      </div>

      {/* ===== Panel kanan: global ATAU personal ===== */}
      <div
        className={`${
          tampilPane ? "flex" : "hidden md:flex"
        } min-w-0 flex-1 flex-col`}
      >
        {aktif.jenis === "global" ? (
          <PanelGlobal
            meId={meId}
            pesan={globalMsgs}
            gagal={gagalMuat}
            statistik={statistik}
            onKembali={() => setTampilPane(false)}
            onKirim={kirimGlobal}
            onChat={bukaPersonal}
          />
        ) : (
          <PanelPersonal
            key={aktif.user.id}
            meId={meId}
            lawan={aktif.user}
            onKembali={() => setTampilPane(false)}
            onTutup={bukaGlobal}
            onTerkirim={muatPercakapan}
          />
        )}
      </div>
    </div>
  );
}

// ==========================================================
// Satu baris di daftar percakapan
// ==========================================================
function ItemPercakapan({
  terpilih,
  avatar,
  nama,
  waktu,
  pratinjau,
  unread = 0,
  onClick,
}: {
  terpilih: boolean;
  avatar: React.ReactNode;
  nama: string;
  waktu: string;
  pratinjau: string;
  unread?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[77px] w-full items-center gap-[11px] border-b border-[#e4e6f0] px-[15px] text-left ${
        terpilih ? "bg-[#f0ecff]" : "bg-white hover:bg-[#f7f8fc]"
      }`}
    >
      {avatar}
      <div className="flex min-w-0 flex-1 flex-col gap-[7px]">
        <div className="flex items-start justify-between gap-2">
          <span className="truncate text-[11px] font-semibold">{nama}</span>
          <span className="shrink-0 text-[8px] text-[#70758a]">{waktu}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="min-w-0 flex-1 truncate text-[9px]">{pratinjau}</span>
          {unread > 0 && (
            <span className="flex size-[17px] shrink-0 items-center justify-center rounded-full bg-[#6d4aff] text-[8px] font-bold text-white">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ==========================================================
// Panel global chat
// ==========================================================
function PanelGlobal({
  meId,
  pesan,
  gagal,
  statistik,
  onKembali,
  onKirim,
  onChat,
}: {
  meId: string;
  pesan: GlobalMsg[] | null;
  gagal: boolean;
  statistik: { online: number; total: number } | null;
  onKembali: () => void;
  onKirim: (teks: string) => Promise<boolean>;
  onChat: (user: UserLite) => void;
}) {
  const [profilId, setProfilId] = useState<string | null>(null); // id PESAN yang kartu profilnya terbuka
  const { ref, onScroll } = useGulirKeBawah(pesan?.length ?? 0);
  const kelompok = kelompokkanHari(pesan ?? []);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#f0ecff]">
      <div className="flex h-[73px] shrink-0 items-center gap-3 border-b border-[#e4e6f0] px-5">
        <button
          type="button"
          onClick={onKembali}
          aria-label="Kembali ke daftar percakapan"
          className="md:hidden"
        >
          <ChevronLeftIcon size={20} />
        </button>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[11px] bg-[#6d4aff] text-white">
          <GlobeIcon size={21} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
          <span className="text-[14px]">Global Game Orbit</span>
          <span className="truncate text-[10px] text-[#168355]">
            {statistik
              ? `${statistik.online.toLocaleString("id-ID")} online  •  ${statistik.total.toLocaleString("id-ID")} anggota`
              : gagal
                ? "Tidak terhubung"
                : "Memuat..."}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-[9px] bg-white px-5 py-[13px] text-[10px]">
        <PinIcon size={14} className="shrink-0" />
        Selamat datang! Saling menghargai, tanpa spam &amp; spoiler.
      </div>

      <div
        ref={ref}
        onScroll={onScroll}
        className="flex min-h-0 flex-1 flex-col gap-[17px] overflow-y-auto p-5"
      >
        {pesan === null && gagal ? (
          <GalatMuat />
        ) : pesan === null ? (
          <p className="m-auto text-[11px] text-[#70758a]">Memuat pesan...</p>
        ) : pesan.length === 0 ? (
          <p className="m-auto text-center text-[11px] text-[#70758a]">
            Belum ada pesan. Jadi yang pertama menyapa!
          </p>
        ) : (
          kelompok.map((hari) => (
            <div key={hari.label} className="flex flex-col gap-[17px]">
              <PemisahHari label={hari.label} />
              {hari.items.map((m) => {
                const mine = m.sender.id === meId;
                return (
                  <div
                    key={m.id}
                    className={`relative flex items-start gap-[9px] ${
                      mine ? "justify-end" : ""
                    }`}
                  >
                    {!mine && (
                      <button
                        type="button"
                        onClick={() => setProfilId(m.id)}
                        aria-label={`Lihat profil ${m.sender.name}`}
                      >
                        <Avatar nama={m.sender.name} size={27} />
                      </button>
                    )}
                    <Balon
                      mine={mine}
                      nama={
                        mine ? undefined : (
                          <button
                            type="button"
                            onClick={() => setProfilId(m.id)}
                            className="hover:underline"
                          >
                            {m.sender.name}
                          </button>
                        )
                      }
                      teks={m.content}
                      waktu={jam(m.createdAt)}
                    />
                    {profilId === m.id && !mine && (
                      <KartuProfil
                        userId={m.sender.id}
                        meId={meId}
                        onClose={() => setProfilId(null)}
                        onChat={(u) => {
                          setProfilId(null);
                          onChat(u);
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      <Composer placeholder="Kirim pesan ke global..." onSend={onKirim} />
    </div>
  );
}

// ==========================================================
// Panel personal chat (menggantikan panel global)
// ==========================================================
function PanelPersonal({
  meId,
  lawan,
  onKembali,
  onTutup,
  onTerkirim,
}: {
  meId: string;
  lawan: UserLite;
  onKembali: () => void;
  onTutup: () => void;
  onTerkirim: () => void;
}) {
  const [user, setUser] = useState<UserLite>(lawan);
  const [pesan, setPesan] = useState<PersonalMsg[] | null>(null);
  const [gagal, setGagal] = useState(false);
  const { ref, onScroll } = useGulirKeBawah(pesan?.length ?? 0);

  // Mengambil pesan sekaligus menandai pesan lawan bicara sebagai terbaca
  const muat = useCallback(async () => {
    const d = await getJson<{ user: UserLite; messages: PersonalMsg[] }>(
      `/api/chat/${lawan.id}?me=${encodeURIComponent(meId)}`,
    );
    if (!d) {
      setGagal(true);
      return;
    }
    setGagal(false);
    setUser(d.user);
    setPesan(d.messages);
  }, [lawan.id, meId]);

  useEffect(() => {
    muat();
  }, [muat]);
  useInterval(muat, 3000);

  const kirim = async (teks: string) => {
    const d = await postJson<{ message: PersonalMsg }>(`/api/chat/${lawan.id}`, {
      senderId: meId,
      content: teks,
    });
    if (!d) return false;
    setPesan((prev) =>
      prev?.some((m) => m.id === d.message.id)
        ? prev
        : [...(prev ?? []), d.message],
    );
    onTerkirim(); // percakapan baru langsung muncul di daftar kiri
    return true;
  };

  const kelompok = kelompokkanHari(pesan ?? []);

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex h-[73px] shrink-0 items-center gap-[10px] border-b border-[#e4e6f0] px-[17px]">
        <button
          type="button"
          onClick={onKembali}
          aria-label="Kembali ke daftar percakapan"
          className="md:hidden"
        >
          <ChevronLeftIcon size={20} />
        </button>
        <Avatar nama={user.name} size={34} online={user.online} />
        <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
          <span className="truncate text-[12px] font-semibold">{user.name}</span>
          <span
            className={`text-[9px] ${
              user.online ? "text-[#168355]" : "text-[#70758a]"
            }`}
          >
            {user.online ? "Online" : "Offline"} • Personal
          </span>
        </div>
        <button
          type="button"
          onClick={onTutup}
          aria-label="Tutup percakapan dan kembali ke global chat"
        >
          <XIcon size={16} />
        </button>
      </div>

      <div
        ref={ref}
        onScroll={onScroll}
        className="flex min-h-0 flex-1 flex-col gap-[17px] overflow-y-auto p-[17px]"
      >
        {pesan === null && gagal ? (
          <GalatMuat />
        ) : pesan === null ? (
          <p className="m-auto text-[11px] text-[#70758a]">Memuat pesan...</p>
        ) : pesan.length === 0 ? (
          <p className="m-auto text-center text-[11px] text-[#70758a]">
            Belum ada pesan. Sapa {user.name.split(" ")[0]}!
          </p>
        ) : (
          kelompok.map((hari) => (
            <div key={hari.label} className="flex flex-col gap-[17px]">
              <PemisahHari label={hari.label} />
              {hari.items.map((m) => {
                const mine = m.senderId === meId;
                return (
                  <div
                    key={m.id}
                    className={`flex ${mine ? "justify-end" : ""}`}
                  >
                    <Balon
                      mine={mine}
                      teks={m.content}
                      waktu={jam(m.createdAt)}
                      centang={
                        mine ? (m.isRead ? "dibaca" : "terkirim") : undefined
                      }
                    />
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      <Composer
        placeholder={`Pesan untuk ${user.name.split(" ")[0]}...`}
        onSend={kirim}
      />
    </div>
  );
}
