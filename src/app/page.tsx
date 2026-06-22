import Link from "next/link";
import { redirect } from "next/navigation";
import { loadCommandCentreForCurrentUser } from "@/app/actions/command-centre";
import CommandCentrePage from "@/modules/command-centre/presentation/components/command-centre-page/command-centre-page";
import styles from "./home.module.scss";

export default async function HomePage() {
  const commandCentre = await loadCommandCentreForCurrentUser();

  // No session — show game entry portal
  if (!commandCentre) {
    return (
      <div className={styles.page}>
        {/* Floating particles (CSS-only) */}
        <div className={styles.particles} aria-hidden="true">
          {[...Array(30)].map((_, i) => (
            <div key={i} className={styles.particle} style={{ "--i": i } as React.CSSProperties} />
          ))}
        </div>

        <div className={styles.entryCard}>
          {/* Decorative emblem */}
          <div className={styles.emblem} aria-hidden="true">
            <div className={styles.emblemRing} />
            <div className={styles.emblemGlow} />
            <div className={styles.emblemIcon}>⚔</div>
          </div>

          <h1 className={styles.title}>Frontend Realms</h1>
          <p className={styles.tagline}>Master Frontend Engineering Through Battle</p>

          <div className={styles.authButtons}>
            <Link href="/login" className={styles.signInBtn}>
              Sign In
            </Link>
            <Link href="/register" className={styles.registerBtn}>
              Create Account
            </Link>
          </div>

          <p className={styles.footerText}>Become a senior engineer. One quest at a time.</p>
        </div>
      </div>
    );
  }

  // Fresh users without a subject selected are routed to subject selection
  if (commandCentre.playerState === "NEW_PLAYER") {
    redirect("/subjects");
  }

  return <CommandCentrePage vm={commandCentre} />;
}
