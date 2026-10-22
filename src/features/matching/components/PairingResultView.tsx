"use client";

import { useRef, useState, type FormEvent } from "react";
import { toPng } from "html-to-image";
import { Check, ChevronDown, Download, Pencil, X } from "lucide-react";
import type { ComputedPair, ComputedPairingResult } from "@/features/matching/services/computePairingResult";
import type { Player } from "@/features/matching/types/pairingResult";

type PairingResultViewProps = {
  result: ComputedPairingResult;
  onRenamePlayer: (startHour: number, sourcePairIndex: number, playerIndex: number, name: string) => Promise<boolean>;
};

function formatHour(hour: number): string {
  return String(hour % 24).padStart(2, "0") + ":00";
}

function EditablePlayerName({
  player,
  startHour,
  sourcePairIndex,
  playerIndex,
  onRenamePlayer,
}: {
  player: Player;
  startHour: number;
  sourcePairIndex: number;
  playerIndex: number;
  onRenamePlayer: PairingResultViewProps["onRenamePlayer"];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(player.name);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = draftName.trim().replace(/\s+/g, " ");
    if (!name) {
      setError("กรุณากรอกชื่อ");
      return;
    }

    setIsSaving(true);
    setError(null);
    const saved = await onRenamePlayer(startHour, sourcePairIndex, playerIndex, name);
    setIsSaving(false);
    if (!saved) {
      setError("บันทึกชื่อไม่สำเร็จ ลองอีกครั้ง");
      return;
    }

    setDraftName(name);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <span className="inline-flex flex-col items-start align-middle">
        <form onSubmit={handleSave} className="inline-flex items-center gap-1" data-export-ignore="true">
          <input
            autoFocus
            aria-label={`แก้ชื่อ ${player.name}`}
            maxLength={80}
            value={draftName}
            onChange={(event) => { setDraftName(event.target.value); setError(null); }}
            className="h-8 w-28 rounded-lg border border-sky-300 bg-white px-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-sky-100"
          />
          <button type="submit" aria-label="บันทึกชื่อ" disabled={isSaving} className="flex size-8 items-center justify-center rounded-lg text-primary hover:bg-sky-50 disabled:opacity-50">
            <Check aria-hidden="true" size={16} />
          </button>
          <button type="button" aria-label="ยกเลิกแก้ชื่อ" disabled={isSaving} onClick={() => { setDraftName(player.name); setError(null); setIsEditing(false); }} className="flex size-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50">
            <X aria-hidden="true" size={16} />
          </button>
        </form>
        {error ? <span role="alert" className="text-xs text-red-600">{error}</span> : null}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-0.5">
      <span>{player.name}</span>
      <button
        type="button"
        aria-label={`แก้ชื่อ ${player.name} เฉพาะคู่นี้`}
        data-export-ignore="true"
        onClick={() => { setDraftName(player.name); setIsEditing(true); }}
        className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-primary"
      >
        <Pencil aria-hidden="true" size={13} />
      </button>
    </span>
  );
}

function PairPlayers({
  pair,
  startHour,
  onRenamePlayer,
}: {
  pair: ComputedPair;
  startHour: number;
  onRenamePlayer: PairingResultViewProps["onRenamePlayer"];
}) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-1">
      {pair.players.map((player, playerIndex) => (
        <span key={player.id + "-" + playerIndex} className="inline-flex items-center">
          <EditablePlayerName
            player={player}
            startHour={startHour}
            sourcePairIndex={pair.sourcePairIndex}
            playerIndex={playerIndex}
            onRenamePlayer={onRenamePlayer}
          />
          {playerIndex < pair.players.length - 1 ? <span className="px-0.5">+</span> : null}
        </span>
      ))}
    </span>
  );
}

function HourResultSection({ hour, onRenamePlayer }: {
  hour: ComputedPairingResult["hours"][number];
  onRenamePlayer: PairingResultViewProps["onRenamePlayer"];
}) {
  const hourRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function saveAsPng() {
    const element = hourRef.current;
    if (!element || isSaving) return;

    const wasExpanded = isExpanded;
    setIsExpanded(true);
    setIsSaving(true);
    setSaveError(null);

    try {
      await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
      await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
      const imageUrl = await toPng(element, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        style: { padding: "20px" },
        filter: (node) => !(node instanceof Element && node.getAttribute("data-export-ignore") === "true"),
      });
      const link = document.createElement("a");
      link.download = "match-" + hour.startHour + "-" + hour.endHour + ".png";
      link.href = imageUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      setSaveError("บันทึกภาพไม่สำเร็จ ลองอีกครั้ง");
    } finally {
      setIsExpanded(wasExpanded);
      setIsSaving(false);
    }
  }

  return (
    <div ref={hourRef} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((expanded) => !expanded)}
          className="flex min-h-11 min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span className="min-w-0 flex-1 text-base font-bold text-slate-900">
            <span>{formatHour(hour.startHour)}–{formatHour(hour.endHour)}</span>
            <span className="ml-2 text-xs font-normal text-slate-500">{hour.courts.length} คอร์ด</span>
          </span>
          <ChevronDown
            aria-hidden="true"
            data-export-ignore="true"
            size={18}
            className={"shrink-0 text-slate-500 transition-transform " + (isExpanded ? "rotate-180" : "")}
          />
        </button>
        <button
          type="button"
          aria-label={"บันทึกผลช่วง " + formatHour(hour.startHour) + " ถึง " + formatHour(hour.endHour) + " เป็น PNG"}
          onClick={saveAsPng}
          disabled={isSaving}
          data-export-ignore="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-50"
        >
          <Download aria-hidden="true" size={18} />
        </button>
      </div>
      {isExpanded ? (
        <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
            {hour.courts.map((court) => (
              <article key={court.courtId} aria-label={court.courtName} className="rounded-xl bg-slate-50 p-3">
                <h3 className="mb-2 text-sm font-semibold text-slate-800">{court.courtName}</h3>
                <ol className="space-y-2">
                  {court.paireds.map((pair, index) => (
                    <li key={court.courtId + "-pair-" + index} className="rounded-lg bg-white px-3 py-2">
                      <span className="block text-xs text-slate-500">คู่ {index + 1}</span>
                      <span className="mt-0.5 block text-sm font-medium text-slate-800">
                        <PairPlayers pair={pair} startHour={hour.startHour} onRenamePlayer={onRenamePlayer} />
                      </span>
                    </li>
                  ))}
                </ol>
                {court.paireds.length === 0 ? <p className="text-sm text-slate-400">ยังไม่มีคู่</p> : null}
              </article>
            ))}
            {hour.paired.length !== 0 ? (
              <div className="rounded-xl bg-slate-100 p-3">
                <h3 className="mb-2 text-sm font-semibold text-slate-700">คู่ที่เหลือ</h3>
                <ol className="space-y-1">
                  {hour.paired.map((pair, index) => (
                    <li key={hour.startHour + "-waiting-" + index} className="text-sm text-slate-600">
                      คู่ {index + 1}: <PairPlayers pair={pair} startHour={hour.startHour} onRenamePlayer={onRenamePlayer} />
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
        </div>
      ) : null}
      {saveError ? <p role="alert" className="mt-2 text-sm text-red-600">{saveError}</p> : null}
    </div>
  );
}

export function PairingResultView({ result, onRenamePlayer }: PairingResultViewProps) {
  return (
    <main aria-label="ผลจับคู่" className="min-h-0 flex-1 overflow-y-auto px-4 pb-[calc(84px+env(safe-area-inset-bottom))] pt-5">
      <header className="mb-5">
        <h1 className="text-xl font-bold text-slate-900">ผลจับคู่</h1>
        <p className="mt-1 text-sm text-slate-500">ดูคู่ที่เล่นในแต่ละช่วงเวลา</p>
      </header>
      {result.hours.length === 0 ? <p className="text-sm text-slate-500">ไม่มีช่วงเวลาที่จับคู่ได้</p> : null}
      <div className="space-y-3">
        {result.hours.map((hour) => <HourResultSection key={hour.startHour} hour={hour} onRenamePlayer={onRenamePlayer} />)}
      </div>
    </main>
  );
}
