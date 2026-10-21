import { CleanLayout } from "@/components/layout/CleanLayout";
import { PairingResultView } from "@/features/matching/components/PairingResultView";
import { computePairingResult } from "@/features/matching/services/computePairingResult";
import { decodePairingResult } from "@/features/matching/services/pairingUrlState";

type MatchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MatchPage({ searchParams }: MatchPageProps) {
  const params = await searchParams;
  const state = typeof params.state === "string" ? params.state : null;
  const fillin = params.fillin === "true";
  const decoded = decodePairingResult(state);

  if (!decoded.success) {
    return (
      <CleanLayout>
        <main className="min-h-0 flex-1 px-4 pt-5">
          <h1 className="text-lg font-semibold text-slate-900">เปิดผลจับคู่ไม่ได้</h1>
          <p role="alert" className="mt-3 rounded-2xl bg-white p-4 text-sm text-slate-600 shadow-sm">
            {decoded.error.message}
          </p>
        </main>
      </CleanLayout>
    );
  }

  const computedResult = computePairingResult(decoded.data, fillin);

  return (
    <CleanLayout>
      <PairingResultView result={computedResult} />
    </CleanLayout>
  );
}
