import { CleanLayout } from "@/components/layout/CleanLayout";
import { PairingResultFlow } from "@/features/matching/components/PairingResultFlow";

type MatchRoomPageProps = {
  params: Promise<{ roomId: string }>;
};

export default async function MatchRoomPage({ params }: MatchRoomPageProps) {
  const { roomId } = await params;

  return (
    <CleanLayout>
      <PairingResultFlow roomId={roomId} />
    </CleanLayout>
  );
}
