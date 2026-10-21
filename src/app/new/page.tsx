import { CleanLayout } from "@/components/layout/CleanLayout";
import { TopNavigation } from "@/components/layout/TopNavigation";

export default function NewPage() {
  return (
    <CleanLayout>
      <TopNavigation />
      <main aria-label="สร้างรายการใหม่" className="min-h-[calc(100dvh-56px)] bg-white" />
    </CleanLayout>
  );
}
