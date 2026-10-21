import { CleanLayout } from "@/components/layout/CleanLayout";
import { TopNavigation } from "@/components/layout/TopNavigation";
import { NewFlow } from "@/features/courts/components/NewFlow";

export default function NewPage() {
  return (
    <CleanLayout>
      <TopNavigation />
      <main aria-label="สร้างรายการใหม่" className="flex-1">
        <NewFlow />
      </main>
    </CleanLayout>
  );
}
