import { redirect } from "next/navigation";
import { loadCommandCentreForCurrentUser } from "@/app/actions/command-centre";
import CommandCentrePage from "@/modules/command-centre/presentation/components/command-centre-page/command-centre-page";

export default async function HomePage() {
  const commandCentre = await loadCommandCentreForCurrentUser();

  // No session — redirect to login instead of showing fake dev fixture data
  if (!commandCentre) {
    redirect("/login");
  }

  return <CommandCentrePage vm={commandCentre} />;
}
