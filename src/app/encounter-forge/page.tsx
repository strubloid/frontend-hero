import { getEncounterForgeInventory } from "@/app/actions/encounter-forge";
import EncounterForge from "@/modules/questions/presentation/components/encounter-forge/encounter-forge";

export default async function EncounterForgePage() {
  const initialInventory = await getEncounterForgeInventory("nextjs");
  return <EncounterForge initialInventory={initialInventory} />;
}
