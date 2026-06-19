"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState, useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { signIn } from "next-auth/react";
import { register, type RegisterResult } from "@/app/actions/auth";
import styles from "./../login/auth.module.scss";

const initialState: RegisterResult = { success: false, error: "" };

function RegisterFormInner() {
  const router = useRouter();
  const captchaRef = useRef<HCaptcha>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState(false);
  const [state, formAction, pending] = useActionState(register, initialState);
  const [googleLoading, setGoogleLoading] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (state.success) {
      router.push("/play");
      router.refresh();
    }
  }, [state.success, router]);

  async function handleSubmit(formData: FormData) {
    if (!captchaToken) {
      setCaptchaError(true);
      return;
    }
    formData.append("h-captcha-response", captchaToken);
    formAction(formData);
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    await signIn("google", { redirectTo: "/play" });
  }

  if (!mounted) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Begin Your Quest</h1>
          <p className={styles.subtitle}>Create an account and enter the realms</p>

          <div
            className={styles.form}
            style={{ display: "flex", justifyContent: "center", padding: "2rem 0" }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                border: "3px solid #334155",
                borderTopColor: "#3b82f6",
                borderRadius: "50%",
                animation: "spin 0.6s linear infinite",
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Begin Your Quest</h1>
        <p className={styles.subtitle}>Create an account and enter the realms</p>

        {state && !state.success && state.error && (
          <div className={styles.error}>{state.error}</div>
        )}

        <form action={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            Name
            <input
              name="name"
              type="text"
              required
              minLength={2}
              className={styles.input}
              placeholder="Adventurer"
            />
          </label>

          <label className={styles.label}>
            Email
            <input
              name="email"
              type="email"
              required
              className={styles.input}
              placeholder="you@example.com"
            />
          </label>

          <label className={styles.label}>
            Password
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className={styles.input}
              placeholder="At least 6 characters"
            />
          </label>

          <div className={styles.captchaWrapper}>
            <HCaptcha
              ref={captchaRef}
              sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? ""}
              onVerify={(token) => {
                setCaptchaToken(token);
                setCaptchaError(false);
              }}
              onExpire={() => {
                setCaptchaToken(null);
                captchaRef.current?.resetCaptcha();
              }}
            />
            {captchaError && (
              <p className={styles.captchaError}>Please complete the security check.</p>
            )}
          </div>

          <button type="submit" disabled={pending || googleLoading} className={styles.btnPrimary}>
            {pending ? "Creating..." : "Create Account"}
          </button>
        </form>

        <div className={styles.divider}>
          <span>or</span>
        </div>
        <p className={styles.footerText}>
          <button
            onClick={handleGoogleSignIn}
            disabled={pending || googleLoading}
            className={styles.btnGoogle}
          >
            <svg viewBox="0 0 24 24" className={styles.googleIcon}>
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </p>

        <p className={styles.footerText}>
          Already have an account?{" "}
          <Link href="/login" className={styles.link}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <RegisterFormInner />;
}
