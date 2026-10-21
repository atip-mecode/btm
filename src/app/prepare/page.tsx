import { CleanLayout } from "@/components/layout/CleanLayout";
import { PrepareCourtsFlow } from "@/features/courts/components/PrepareCourtsFlow";
import { parseStartHour } from "@/features/courts/utils/courtSchedule";

type PreparePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PreparePage({ searchParams }: PreparePageProps) {
  const params = await searchParams;
  const courtIdParam = params.courtId;
  const selectedCourtIds = typeof courtIdParam === "string"
    ? [courtIdParam]
    : Array.isArray(courtIdParam)
      ? courtIdParam
      : [];
  return (
    <CleanLayout>
      <PrepareCourtsFlow
        startHour={parseStartHour(params.start)}
        selectedCourtIds={Array.from(new Set(selectedCourtIds.filter(Boolean)))}
      />
    </CleanLayout>
  );
}
