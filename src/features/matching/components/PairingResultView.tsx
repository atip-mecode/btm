"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { ChevronDown, Download } from "lucide-react";
import type { HourlyPairing, PairingResult } from "@/features/matching/types/pairingResult";

type PairingResultViewProps = {
  result: PairingResult;
};

function formatHour(hour: number): string {
  return String(hour % 24).padStart(2, "0") + ":00";
}

function pairName(pair: HourlyPairing["paired"][number]): string {
  return pair.map((player) => player.name).join(" + ");
}

function HourResultSection({ hour }: { hour: HourlyPairing }) {
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
                      <span className="mt-0.5 block text-sm font-medium text-slate-800">{pairName(pair)}</span>
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
                      คู่ {index + 1}: {pairName(pair)}
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

export function PairingResultView({ result }: PairingResultViewProps) {
  return (
    <main aria-label="ผลจับคู่" className="min-h-0 flex-1 overflow-y-auto px-4 pb-[calc(84px+env(safe-area-inset-bottom))] pt-5">
      <header className="mb-5">
        <h1 className="text-xl font-bold text-slate-900">ผลจับคู่</h1>
        <p className="mt-1 text-sm text-slate-500">ดูคู่ที่เล่นในแต่ละช่วงเวลา</p>
      </header>
      {result.hours.length === 0 ? <p className="text-sm text-slate-500">ไม่มีช่วงเวลาที่จับคู่ได้</p> : null}
      <div className="space-y-3">
        {result.hours.map((hour) => <HourResultSection key={hour.startHour} hour={hour} />)}
      </div>
    </main>
  );
}
