"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LayoutDashboard, FileText, MessageSquare, LogOut } from "lucide-react";
import logo from "@/images/logo.png";
import Image from "next/image";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/applications", label: "Applications", icon: FileText },
  { href: "/chat", label: "Live Support", icon: MessageSquare },
];

export default function Sidebar() {
  const path = usePathname();
  const { admin, signOut } = useAuth();

  const initials = admin?.full_name
    ? admin.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <aside
      style={{
        width: 232,
        minWidth: 232,
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        background: "var(--bg2)",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "1.25rem",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            flexShrink: 0,
            background: "linear-gradient(135deg,#9359FF,#6B35CC)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // boxShadow: "0 4px 12px rgba(147,89,255,0.35)",
          }}
        >
          <Image draggable={false} height={34} width={34} src={logo} alt="logo" />
        </div>
        <div>
          <div
            style={{
              fontSize: "0.9375rem",
              fontWeight: 700,
              color: "var(--text)",
              letterSpacing: "-0.01em",
            }}
          >
            Caterfy
          </div>
          <div
            style={{
              fontSize: "0.6875rem",
              color: "var(--text3)",
              marginTop: -1,
            }}
          >
            Admin Panel
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav
        style={{
          flex: 1,
          padding: "0.875rem 0.625rem",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <div
          style={{
            fontSize: "0.625rem",
            fontWeight: 700,
            color: "var(--text3)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "0 6px",
            marginBottom: 6,
          }}
        >
          Menu
        </div>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard" ? path === href : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "0.5625rem 0.625rem",
                borderRadius: 8,
                fontSize: "0.875rem",
                fontWeight: active ? 600 : 400,
                color: active ? "#C49BFF" : "var(--text2)",
                background: active ? "rgba(147,89,255,0.1)" : "transparent",
                border: `1px solid ${active ? "rgba(147,89,255,0.18)" : "transparent"}`,
                textDecoration: "none",
                transition: "all 0.12s",
              }}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Admin info */}
      <div
        style={{ padding: "0.625rem", borderTop: "1px solid var(--border)" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0.625rem 0.75rem",
            borderRadius: 8,
            background: "var(--bg3)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              flexShrink: 0,
              background: "linear-gradient(135deg,#9359FF,#6B35CC)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.6875rem",
              fontWeight: 700,
              color: "white",
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "var(--text)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {admin?.full_name ?? "Admin"}
            </div>
            <div
              style={{
                fontSize: "0.6875rem",
                color: "var(--text3)",
                textTransform: "capitalize",
              }}
            >
              {admin?.role?.replace("_", " ") ?? "admin"}
            </div>
          </div>
          <button
            onClick={signOut}
            title="Sign out"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text3)",
              padding: 4,
              borderRadius: 6,
              display: "flex",
              transition: "color 0.12s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#F87171")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text3)")}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
