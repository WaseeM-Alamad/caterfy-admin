"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { AppBadge, TicketBadge } from "@/components/Badge";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { VendorApplication, ChatTicket } from "@/types";
import { formatDistanceToNow } from "date-fns";
import {
  FileText,
  MessageSquare,
  Clock,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

interface Stats {
  total: number;
  pending: number;
  approved: number;
  declined: number;
  open: number;
  claimed: number;
  resolved: number;
}

export default function DashboardPage() {
  const { admin } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentApps, setRecentApps] = useState<VendorApplication[]>([]);
  const [recentTickets, setRecentTickets] = useState<ChatTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [appRes, ticketRes, recentAppRes, recentTicketRes] =
          await Promise.all([
            supabase.from("vendor_applications").select("status"),
            supabase.from("chat_tickets").select("status"),
            supabase
              .from("vendor_applications")
              .select("*")
              .order("created_at", { ascending: false })
              .limit(6),
            supabase
              .from("chat_tickets")
              .select(`*`)
              .order("created_at", { ascending: false })
              .limit(6),
          ]);

        if (cancelled) return;

        const apps = appRes.data ?? [];
        const tickets = ticketRes.data ?? [];

        setStats({
          total: apps.length,
          pending: apps.filter((a) => a.status === "pending").length,
          approved: apps.filter((a) => a.status === "approved").length,
          declined: apps.filter((a) => a.status === "declined").length,
          open: tickets.filter((t) => t.status === "open").length,
          claimed: tickets.filter((t) => t.status === "claimed").length,
          resolved: tickets.filter((t) => t.status === "resolved").length,
        });
        setRecentApps(recentAppRes.data ?? []);
        setRecentTickets(recentTicketRes.data ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const statCards = [
    {
      label: "Total Applications",
      value: stats?.total,
      icon: FileText,
      color: "#9359FF",
      bg: "rgba(147,89,255,0.1)",
    },
    {
      label: "Pending Review",
      value: stats?.pending,
      icon: Clock,
      color: "#FCD34D",
      bg: "rgba(252,211,77,0.1)",
    },
    {
      label: "Approved Vendors",
      value: stats?.approved,
      icon: CheckCircle,
      color: "#4ADE80",
      bg: "rgba(74,222,128,0.1)",
    },
    {
      label: "Open Tickets",
      value: stats?.open,
      icon: MessageSquare,
      color: "#60A5FA",
      bg: "rgba(96,165,250,0.1)",
    },
  ];

  return (
    <AppShell>
      <div style={{ padding: "2rem", maxWidth: 1100 }}>
        {/* Header */}
        <div className="animate-slide-up" style={{ marginBottom: "1.75rem" }}>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--text)",
              letterSpacing: "-0.02em",
              marginBottom: 4,
            }}
          >
            {greeting}, {admin?.full_name?.split(" ")[0] ?? "Admin"} 👋
          </h1>
          <p style={{ color: "var(--text3)", fontSize: "0.875rem" }}>
            Here's what's happening on your platform today.
          </p>
        </div>

        {/* Stat cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))",
            gap: "1rem",
            marginBottom: "1.75rem",
          }}
        >
          {statCards.map(({ label, value, icon: Icon, color, bg }, i) => (
            <div
              key={label}
              className={`card animate-slide-up delay-${i * 50}`}
              style={{ padding: "1.125rem" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={17} style={{ color }} />
                </div>
                <TrendingUp
                  size={11}
                  style={{ color: "#4ADE80", marginTop: 4 }}
                />
              </div>
              <div
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  color: "var(--text)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                {loading ? (
                  <span style={{ color: "var(--text3)" }}>—</span>
                ) : (
                  (value ?? 0)
                )}
              </div>
              <div
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--text3)",
                  marginTop: 5,
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Two-column feed */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.125rem",
          }}
        >
          {/* Recent Applications */}
          <div
            className="card animate-slide-up delay-200"
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                padding: "1rem 1.125rem 0.875rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <FileText size={14} style={{ color: "var(--brand)" }} />
                <span
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "var(--text)",
                  }}
                >
                  Recent Applications
                </span>
              </div>
              <Link
                href="/applications"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: "0.75rem",
                  color: "var(--brand)",
                  textDecoration: "none",
                }}
              >
                View all <ArrowRight size={11} />
              </Link>
            </div>
            {loading ? (
              <div style={{ padding: "2rem", textAlign: "center" }}>
                <div className="spinner" style={{ margin: "0 auto" }} />
              </div>
            ) : recentApps.length === 0 ? (
              <p
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  color: "var(--text3)",
                  fontSize: "0.875rem",
                }}
              >
                No applications yet
              </p>
            ) : (
              recentApps.map((app, i) => (
                <Link
                  key={app.id}
                  href={`/applications/${app.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem 1.125rem",
                    borderBottom:
                      i < recentApps.length - 1
                        ? "1px solid var(--border)"
                        : "none",
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
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text3)",
                        marginTop: 1,
                      }}
                    >
                      {formatDistanceToNow(new Date(app.created_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                  <AppBadge status={app.status} />
                </Link>
              ))
            )}
          </div>

          {/* Recent Tickets */}
          <div
            className="card animate-slide-up delay-200"
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                padding: "1rem 1.125rem 0.875rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <MessageSquare size={14} style={{ color: "#60A5FA" }} />
                <span
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "var(--text)",
                  }}
                >
                  Support Tickets
                </span>
              </div>
              <Link
                href="/chat"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: "0.75rem",
                  color: "var(--brand)",
                  textDecoration: "none",
                }}
              >
                View all <ArrowRight size={11} />
              </Link>
            </div>
            {loading ? (
              <div style={{ padding: "2rem", textAlign: "center" }}>
                <div className="spinner" style={{ margin: "0 auto" }} />
              </div>
            ) : recentTickets.length === 0 ? (
              <p
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  color: "var(--text3)",
                  fontSize: "0.875rem",
                }}
              >
                No tickets yet
              </p>
            ) : (
              recentTickets.map((ticket, i) => (
                <Link
                  key={ticket.id}
                  href={`/chat?ticket=${ticket.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem 1.125rem",
                    borderBottom:
                      i < recentTickets.length - 1
                        ? "1px solid var(--border)"
                        : "none",
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
                  <div>
                    <div
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "var(--text)",
                      }}
                    >
                      {ticket.user_name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text3)",
                        marginTop: 1,
                      }}
                    >
                      {ticket.subject}
                    </div>
                  </div>
                  <TicketBadge status={ticket.status} />
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
