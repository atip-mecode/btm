import { CleanLayout } from "@/components/layout/CleanLayout";
import { TopNavigation } from "@/components/layout/TopNavigation";
import { MemberForm } from "@/features/members/components/MemberForm";

export default function NewPage() {
  return (
    <CleanLayout>
      <TopNavigation />
      <main aria-label="สร้างรายการใหม่" className="flex-1">
        <MemberForm />
      </main>
    </CleanLayout>
  );
}
