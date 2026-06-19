import { loadCommandCentreForCurrentUser } from "@/app/actions/command-centre";
import CommandCentrePage from "@/modules/command-centre/presentation/components/command-centre-page/command-centre-page";

export default async function HomePage() {
  const commandCentre = await loadCommandCentreForCurrentUser();
  return <CommandCentrePage vm={commandCentre} />;
}
