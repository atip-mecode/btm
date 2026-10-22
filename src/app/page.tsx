import { HomeLayout } from "@/components/layout/HomeLayout";
import { RoomList } from "@/features/matching/components/RoomList";

export default function HomePage() {
  return (
    <HomeLayout>
      <RoomList />
    </HomeLayout>
  );
}
