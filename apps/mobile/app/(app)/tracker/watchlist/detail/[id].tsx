import { useLocalSearchParams } from "expo-router";
import { TrackerAccountsDetailContainer } from "@/experiences/tracker/flows/watchlist/containers/detail";

export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <TrackerAccountsDetailContainer accountId={id} />;
}
