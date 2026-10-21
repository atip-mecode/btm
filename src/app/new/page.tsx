import { CleanLayout } from "@/components/layout/CleanLayout";
import { BottomActionNavigation } from "@/components/layout/BottomActionNavigation";
import { NewFlow } from "@/features/courts/components/NewFlow";

export default function NewPage() {
  return (
    <CleanLayout>
      <main aria-label="สร้างรายการใหม่" className="min-h-0 flex-1 overflow-y-auto pb-[calc(84px+env(safe-area-inset-bottom))]">
        <NewFlow />
      </main>
      <BottomActionNavigation />
    </CleanLayout>
  );
}
