"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { LayoutDashboard, FileText, MessageSquare, LogOut } from "lucide-react";

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
          }}
        >
          <svg
            width="17"
            height="18"
            viewBox="0 0 17 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.04213 0C10.3219 4.08161e-06 11.5034 0.223052 12.5862 0.6692C13.0007 0.835848 13.3944 1.02753 13.7673 1.24418C14.7578 1.81971 14.7671 3.17806 13.9629 4.00078L13.6532 4.31772C12.936 5.05143 11.7374 4.92377 10.8368 4.44234C10.2689 4.13466 9.64795 3.98075 8.97399 3.98074C8.35301 3.98074 7.77737 4.10764 7.24726 4.36148C6.71717 4.61532 6.25148 4.96921 5.85014 5.42303C5.45634 5.87687 5.14957 6.40773 4.92996 7.01543C4.71037 7.6231 4.60053 8.28075 4.60053 8.9884C4.60053 9.70378 4.71035 10.3654 4.92996 10.9731C5.14957 11.5808 5.45635 12.1154 5.85014 12.577C6.25148 13.0307 6.71717 13.3847 7.24726 13.6385C7.77737 13.8924 8.35301 14.0191 8.97399 14.0191C9.64793 14.0191 10.2689 13.8654 10.8368 13.5577C11.4048 13.2501 12.2748 12.4614 12.4071 12.375C12.4138 12.3692 15.3317 9.86191 16.6294 11.25C17.9285 12.6397 15.3952 15.4192 15.3952 15.4192C14.5925 16.2038 13.707 16.9039 12.6089 17.3422C11.5184 17.7808 10.3295 18 9.04213 18C7.74716 18 6.54679 17.777 5.44115 17.3308C4.34307 16.877 3.38506 16.2462 2.56718 15.4385C1.7569 14.6231 1.12466 13.6693 0.670287 12.577C0.22349 11.4847 0 10.2923 0 9C0 7.70769 0.22349 6.51534 0.670287 5.42303C1.12466 4.33076 1.75692 3.38075 2.56718 2.57309C3.38506 1.7577 4.34308 1.12696 5.44115 0.680802C6.5468 0.226962 7.74715 0 9.04213 0Z"
              fill="white"
            />
          </svg>
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
