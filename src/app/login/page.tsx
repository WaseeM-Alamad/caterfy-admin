"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { signIn, status, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (status === "ready" && user) router.replace("/dashboard");
  }, [status, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setError("Invalid email or password.");
      setLoading(false);
    }
    // On success, onAuthStateChange fires → status becomes ready → useEffect above redirects
  };

  return (
    <div
      className="grid-bg"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {/* Glow blobs */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(147,89,255,0.1) 0%,transparent 70%)",
          top: -80,
          left: -80,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(147,89,255,0.07) 0%,transparent 70%)",
          bottom: 0,
          right: 0,
          pointerEvents: "none",
        }}
      />

      <div
        className="animate-slide-up"
        style={{ width: "100%", maxWidth: 400, padding: "0 1rem" }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              borderRadius: 14,
              marginBottom: 14,
              background: "linear-gradient(135deg,#9359FF,#6B35CC)",
            }}
          >
            <svg
              width="26"
              height="27"
              viewBox="0 0 26 27"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.8291 0C15.7865 6.12241e-06 17.5934 0.334578 19.2495 1.0038C19.8834 1.25377 20.4856 1.54129 21.0559 1.86627C22.5708 2.72957 22.5849 4.7671 21.3551 6.00117L20.8814 6.47657C19.7845 7.57714 17.9513 7.38565 16.574 6.66352C15.7053 6.202 14.7557 5.97113 13.7249 5.97111C12.7752 5.97111 11.8948 6.16146 11.084 6.54223C10.2733 6.92298 9.56109 7.45382 8.94727 8.13454C8.34499 8.8153 7.87582 9.6116 7.53994 10.5231C7.2041 11.4346 7.03611 12.4211 7.0361 13.4826C7.0361 14.5557 7.20407 15.5482 7.53994 16.4597C7.87582 17.3712 8.34501 18.1732 8.94727 18.8655C9.56109 19.5461 10.2733 20.077 11.084 20.4578C11.8948 20.8385 12.7752 21.0286 13.7249 21.0286C14.7557 21.0286 15.7054 20.7981 16.574 20.3365C17.4426 19.8751 18.7732 18.6922 18.9755 18.5625C18.9859 18.5538 23.4485 14.7929 25.4332 16.875C27.42 18.9596 23.5455 23.1288 23.5455 23.1288C22.318 24.3057 20.9636 25.3559 19.2841 26.0133C17.6164 26.6713 15.798 27 13.8291 27C11.8486 27 10.0127 26.6655 8.32176 25.9962C6.64235 25.3155 5.17715 24.3693 3.92628 23.1578C2.68703 21.9346 1.72007 20.504 1.02515 18.8655C0.341808 17.227 0 15.4385 0 13.5C0 11.5615 0.341808 9.77301 1.02515 8.13454C1.72006 6.49613 2.68705 5.07113 3.92628 3.85963C5.17715 2.63655 6.64235 1.69044 8.32176 1.0212C10.0127 0.340442 11.8486 0 13.8291 0Z"
                fill="white"
              />
            </svg>
          </div>
          <h1
            style={{
              fontSize: "1.625rem",
              fontWeight: 700,
              color: "var(--text)",
              letterSpacing: "-0.02em",
              marginBottom: 4,
            }}
          >
            Caterfy Admin
          </h1>
          <p style={{ color: "var(--text3)", fontSize: "0.875rem" }}>
            Sign in to manage your platform
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "rgba(19,13,33,0.9)",
            border: "1px solid rgba(147,89,255,0.18)",
            borderRadius: 16,
            padding: "1.75rem",
            backdropFilter: "blur(20px)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.125rem",
            }}
          >
            {/* Email */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  color: "var(--text2)",
                  marginBottom: 6,
                }}
              >
                Email
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={14}
                  style={{
                    position: "absolute",
                    left: 11,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text3)",
                  }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@caterfy.com"
                  required
                  autoComplete="email"
                  className="input"
                  style={{ paddingLeft: "2.125rem" }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  color: "var(--text2)",
                  marginBottom: 6,
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={14}
                  style={{
                    position: "absolute",
                    left: 11,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text3)",
                  }}
                />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="input"
                  style={{ paddingLeft: "2.125rem", paddingRight: "2.5rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  style={{
                    position: "absolute",
                    right: 11,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text3)",
                    display: "flex",
                    padding: 2,
                  }}
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "0.625rem 0.875rem",
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: 8,
                  color: "#F87171",
                  fontSize: "0.8125rem",
                }}
              >
                <AlertCircle size={13} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{
                justifyContent: "center",
                padding: "0.6875rem",
                fontSize: "0.9375rem",
                marginTop: 4,
              }}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 15, height: 15 }} />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>

        <p
          style={{
            textAlign: "center",
            color: "var(--text3)",
            fontSize: "0.75rem",
            marginTop: "1.25rem",
          }}
        >
          Admin access only · Caterfy © 2025
        </p>
      </div>
    </div>
  );
}
