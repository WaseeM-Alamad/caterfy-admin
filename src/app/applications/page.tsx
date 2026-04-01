"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { AppBadge } from "@/components/Badge";
import { supabase } from "@/lib/supabase";
import { VendorApplication, ApplicationStatus } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Search, FileText, ArrowRight } from "lucide-react";

const TABS: { label: string; value: ApplicationStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "In Review", value: "under_review" },
  { label: "Approved", value: "approved" },
  { label: "Declined", value: "declined" },
];

export default function ApplicationsPage() {
  const [apps, setApps] = useState<VendorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<ApplicationStatus | "all">("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("vendor_applications")
      .select("*")
      .order("created_at", { ascending: false });
    setApps(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = TABS.reduce<Record<string, number>>((acc, t) => {
    acc[t.value] =
      t.value === "all"
        ? apps.length
        : apps.filter((a) => a.status === t.value).length;
    return acc;
  }, {});

  const visible = apps
    .filter((a) => tab === "all" || a.status === tab)
    .filter((a) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        a.store_name.toLowerCase().includes(q) ||
        a.owner_name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q)
      );
    });

  return (
    <AppShell>
      <div style={{ padding: "2rem", maxWidth: 1050 }}>
        {/* Header */}
        <div className="animate-slide-up" style={{ marginBottom: "1.5rem" }}>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--text)",
              letterSpacing: "-0.02em",
              marginBottom: 4,
            }}
          >
            Vendor Applications
          </h1>
          <p style={{ color: "var(--text3)", fontSize: "0.875rem" }}>
            Review and manage store owner applications.
          </p>
        </div>

        {/* Filter tabs */}
        <div
          style={{
            display: "flex",
            gap: 3,
            marginBottom: "1rem",
            background: "var(--bg2)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: 4,
            width: "fit-content",
          }}
        >
          {TABS.map((t) => {
            const active = tab === t.value;
            return (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                style={{
                  padding: "0.375rem 0.75rem",
                  borderRadius: 7,
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.8125rem",
                  fontWeight: active ? 600 : 400,
                  color: active ? "var(--text)" : "var(--text3)",
                  background: active ? "var(--bg4)" : "transparent",
                  transition: "all 0.12s",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                {t.label}
                {counts[t.value] > 0 && (
                  <span
                    style={{
                      background: active
                        ? "rgba(147,89,255,0.25)"
                        : "var(--bg3)",
                      color: active ? "#C49BFF" : "var(--text3)",
                      fontSize: "0.625rem",
                      fontWeight: 700,
                      padding: "1px 6px",
                      borderRadius: 10,
                    }}
                  >
                    {counts[t.value]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div
          style={{
            position: "relative",
            maxWidth: 340,
            marginBottom: "1.125rem",
          }}
        >
          <Search
            size={13}
            style={{
              position: "absolute",
              left: 11,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text3)",
            }}
          />
          <input
            type="text"
            placeholder="Search store, owner, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            style={{ paddingLeft: "2rem", fontSize: "0.8125rem" }}
          />
        </div>

        {/* Table */}
        <div className="card animate-slide-up" style={{ overflow: "hidden" }}>
          {/* Header row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1.4fr 0.8fr 1fr 1fr 28px",
              padding: "0.625rem 1.125rem",
              borderBottom: "1px solid var(--border)",
              fontSize: "0.6875rem",
              fontWeight: 700,
              color: "var(--text3)",
              letterSpacing: "0.07em",
              textTransform: "uppercase",
            }}
          >
            <span>Store</span>
            <span>Owner</span>
            <span>Status</span>
            <span>Submitted</span>
            <span />
          </div>

          {/* Rows */}
          {loading ? (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <div className="spinner" style={{ margin: "0 auto 10px" }} />
              <p style={{ color: "var(--text3)", fontSize: "0.875rem" }}>
                Loading…
              </p>
            </div>
          ) : visible.length === 0 ? (
            <div style={{ padding: "4rem", textAlign: "center" }}>
              <FileText
                size={36}
                style={{
                  color: "var(--text3)",
                  opacity: 0.3,
                  margin: "0 auto 10px",
                }}
              />
              <p style={{ color: "var(--text3)", fontSize: "0.875rem" }}>
                No applications found
              </p>
            </div>
          ) : (
            visible.map((app, i) => (
              <Link
                key={app.id}
                href={`/applications/${app.id}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1.4fr 0.8fr 1fr 1fr 28px",
                  padding: "0.875rem 1.125rem",
                  alignItems: "center",
                  borderBottom:
                    i < visible.length - 1 ? "1px solid var(--border)" : "none",
                  textDecoration: "none",
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(147,89,255,0.04)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {/* Store */}
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      flexShrink: 0,
                      background:
                        "linear-gradient(135deg,rgba(147,89,255,0.25),rgba(107,53,204,0.25))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.8125rem",
                      fontWeight: 700,
                      color: "#C49BFF",
                    }}
                  >
                    {app.store_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "var(--text)",
                      }}
                    >
                      {app.store_name}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text3)" }}>
                      {app.business_type}
                    </div>
                  </div>
                </div>
                {/* Owner */}
                <div>
                  <div style={{ fontSize: "0.875rem", color: "var(--text)" }}>
                    {app.owner_name}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text3)" }}>
                    {app.email}
                  </div>
                </div>
                <div>
                  <AppBadge status={app.status} />
                </div>
                <div style={{ fontSize: "0.8125rem", color: "var(--text3)" }}>
                  {formatDistanceToNow(new Date(app.created_at), {
                    addSuffix: true,
                  })}
                </div>
                <ArrowRight size={13} style={{ color: "var(--text3)" }} />
              </Link>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
