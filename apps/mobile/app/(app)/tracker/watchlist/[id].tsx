import { useLocalSearchParams } from "expo-router";
import { TrackerWatchlistDetailContainer } from "@/experiences/tracker/flows/watchlist/containers/detail";

export default function WatchlistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <TrackerWatchlistDetailContainer watchableUnitId={id} />;
}
