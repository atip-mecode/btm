import type { HourlyPairing, PairingResult } from "@/features/matching/types/pairingResult";

type PairingResultViewProps = {
  result: PairingResult;
};

function formatHour(hour: number): string {
  return `${String(hour % 24).padStart(2, "0")}:00`;
}

function pairName(pair: HourlyPairing["paired"][number]): string {
  return pair.map((player) => player.name).join(" + ");
}

export function PairingResultView({ result }: PairingResultViewProps) {
  return (
    <main aria-label="ผลจับคู่" className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
      <h1 className="mb-4 text-lg font-semibold">ผลจับคู่</h1>
      {result.hours.length === 0 ? <p>ไม่มีช่วงเวลาที่จับคู่ได้</p> : null}
      <div className="space-y-4">
        {result.hours.map((hour) => (
          <section key={hour.startHour}>
            <h2 className="font-semibold">{formatHour(hour.startHour)}–{formatHour(hour.endHour)}</h2>
            {hour.courts.map((court) => (
              <div key={court.courtId}>
                <h3>{court.courtName}</h3>
                {court.paireds.map((pair, index) => (
                  <p key={`${court.courtId}-pair-${index}`} className="text-sm">
                    คู่ {index + 1}: {pairName(pair)}
                  </p>
                ))}
              </div>
            ))}
            {hour.paired.length !== 0 ? (
              <div>
                <h3>รอจัดลงคอร์ด</h3>
                {hour.paired.map((pair, index) => (
                  <p key={`${hour.startHour}-waiting-${index}`} className="text-sm">
                    คู่ {index + 1}: {pairName(pair)}
                  </p>
                ))}
              </div>
            ) : null}
          </section>
        ))}
      </div>
    </main>
  );
}
