import { CleanLayout } from "@/components/layout/CleanLayout";
import { NewFlow } from "@/features/courts/components/NewFlow";
import { parseStartHour } from "@/features/courts/utils/courtSchedule";

type NewPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewPage({ searchParams }: NewPageProps) {
  const params = await searchParams;
  const parsedStartHour = parseStartHour(params.start);
  const initialStartHour = parsedStartHour === null ? "" : String(parsedStartHour).padStart(2, "0");
  return (
    <CleanLayout>
      <NewFlow initialStartHour={initialStartHour} />
    </CleanLayout>
  );
}
