"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronRight } from "lucide-react";
import { useColorTheme } from "./ThemeContext";

const LINKS = [
  { label: "Tentang",    href: "/#about",      anchor: "about",      pages: ["/"] },
  { label: "Pengalaman", href: "/#experience", anchor: "experience", pages: ["/"] },
  { label: "Pendidikan", href: "/#education",  anchor: "education",  pages: ["/"] },
  { label: "Projects",   href: "/projects",    anchor: null,         pages: ["/projects"] },
  { label: "Kreator",    href: "/creator",     anchor: null,         pages: ["/creator"] },
];

const DOT_SECTIONS = [
  { id: "about",      label: "Tentang" },
  { id: "experience", label: "Pengalaman" },
  { id: "education",  label: "Pendidikan" },
  { id: "contact",    label: "Kontak" },
];

// ── THEME TOGGLE ───────────────────────────────────
function ThemeToggle({ size = "md" }: { size?: "md" | "sm" }) {
  const { colorTheme, toggleColorTheme } = useColorTheme();
  const [animating, setAnimating] = useState(false);
  const isGreen = colorTheme === "green";
  const pad = size === "sm" ? "7px 12px" : "7px 14px";

  const handleToggle = () => {
    if (animating) return;
    setAnimating(true);
    toggleColorTheme();
    setTimeout(() => setAnimating(false), 420);
  };

  return (
    <button
      onClick={handleToggle}
      aria-label={`Switch to ${isGreen ? "orange" : "green"} theme`}
      title={`Switch to ${isGreen ? "orange" : "green"} theme`}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: pad, borderRadius: 999,
        background: isGreen ? "rgba(34,197,94,.12)" : "rgba(14,165,233,.12)",
        border: `1px solid ${isGreen ? "rgba(34,197,94,.28)" : "rgba(14,165,233,.28)"}`,
        cursor: "none",
        transition: "background .45s, border-color .45s",
        flexShrink: 0,
        outline: "none",
        WebkitTapHighlightColor: "transparent",
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.06)")}
      onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
    >
      {/* Track */}
      <span style={{
        position: "relative", width: 32, height: 18, borderRadius: 999,
        background: isGreen ? "rgba(34,197,94,.25)" : "rgba(14,165,233,.20)",
        border: `1px solid ${isGreen ? "rgba(34,197,94,.40)" : "rgba(14,165,233,.40)"}`,
        display: "inline-flex", alignItems: "center",
        transition: "background .45s, border-color .45s",
        flexShrink: 0,
        overflow: "hidden",
      }}>
        {animating && (
          <span style={{
            position: "absolute", inset: 0, borderRadius: 999,
            background: isGreen ? "rgba(34,197,94,.35)" : "rgba(14,165,233,.35)",
            animation: "toggleRipple .4s ease-out forwards",
            pointerEvents: "none",
          }}/>
        )}
        <span style={{
          position: "absolute",
          left: isGreen ? 15 : 2,
          width: 12, height: 12, borderRadius: "50%",
          background: isGreen ? "#22c55e" : "#0ea5e9",
          boxShadow: isGreen ? "0 0 8px rgba(34,197,94,.70)" : "0 0 8px rgba(14,165,233,.70)",
          transition: "left .35s cubic-bezier(.34,1.56,.64,1), background .45s, box-shadow .45s",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 7,
          animation: animating ? "thumbSpin .4s ease" : "none",
        }}>
          {isGreen ? "🌿" : "🌊"}
        </span>
      </span>
      {/* Label */}
      <span style={{
        fontSize: 10.5, fontWeight: 700, letterSpacing: ".06em",
        color: isGreen ? "#4ade80" : "#7dd3fc",
        transition: "color .45s, opacity .2s",
        whiteSpace: "nowrap",
        opacity: animating ? 0.6 : 1,
      }}>
        {isGreen ? "Green" : "Blue"}
      </span>
    </button>
  );
}

// ── DOT NAVIGATION ────────────────────────────────
function DotNav() {
  const path = usePathname();
  const [active, setActive] = useState("about");

  useEffect(() => {
    if (path !== "/") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { threshold: [0.2, 0.5], rootMargin: "-20% 0px -20% 0px" }
    );
    DOT_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [path]);

  if (path !== "/") return null;

  return (
    <div className="dot-nav hidden md:flex" role="navigation" aria-label="Section navigation">
      {DOT_SECTIONS.map(({ id, label }, i) => (
        <motion.div
          key={id}
          className="dot-nav-item"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 + i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            className={`dot-nav-btn${active === id ? " is-active" : ""}`}
            onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}
            aria-label={`Scroll to ${label}`}
          />
          <span className="dot-nav-tooltip">{label}</span>
        </motion.div>
      ))}
    </div>
  );
}

// ── MAIN NAVBAR ───────────────────────────────────
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const router = useRouter();
  const { colorTheme } = useColorTheme();
  const logoSrc = colorTheme === "green" ? "/images/logo-green.png" : "/images/logo.png";

  // Magnetic bubble state
  const linksRef = useRef<HTMLDivElement>(null);
  const [bubble, setBubble] = useState({ left: 0, width: 0, visible: false });

  const handleLinkEnter = (e: React.MouseEvent<HTMLElement>) => {
    const container = linksRef.current;
    if (!container) return;
    const cr = container.getBoundingClientRect();
    const lr = e.currentTarget.getBoundingClientRect();
    setBubble({ left: lr.left - cr.left, width: lr.width, visible: true });
  };

  const handleLinksLeave = () => {
    setBubble(prev => ({ ...prev, visible: false }));
  };

  const scrollTo = (anchor: string, closeMenu = false) => {
    if (closeMenu) setOpen(false);
    const doScroll = () => {
      const el = document.getElementById(anchor);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    if (path !== "/") { router.push("/"); setTimeout(doScroll, 600); }
    else doScroll();
  };

  const scrollToTop = useCallback((closeMenu = false) => {
    if (closeMenu) setOpen(false);
    if (path !== "/") { router.push("/"); setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 400); }
    else window.scrollTo({ top: 0, behavior: "smooth" });
  }, [path, router]);

  const NavLink = ({ l, mobile = false, onClick }: { l: typeof LINKS[0]; mobile?: boolean; onClick?: () => void }) => {
    const isActive = l.pages.includes(path) && !l.anchor;
    const cls = `pill-nav-link${isActive ? " is-active" : ""}`;
    const mobileStyle = mobile ? { fontSize: 22, fontWeight: 700, padding: "10px 24px" } : undefined;
    if (l.anchor) {
      return (
        <button
          className={cls}
          style={mobileStyle}
          onClick={() => scrollTo(l.anchor!, mobile)}
          onMouseEnter={mobile ? undefined : handleLinkEnter}
        >
          {l.label}
        </button>
      );
    }
    return (
      <Link
        href={l.href}
        className={cls}
        style={mobileStyle}
        onClick={onClick}
        onMouseEnter={mobile ? undefined : handleLinkEnter}
      >
        {l.label}
      </Link>
    );
  };

  return (
    <>
      {/* ── DESKTOP ── */}
      <header className="hidden md:flex"
        style={{ position: "fixed", top: 20, left: 0, right: 0, zIndex: 200, justifyContent: "center", pointerEvents: "none" }}>
        <motion.nav
          initial={{ y: -72, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: .72, ease: [.22, 1, .36, 1], delay: .12 }}
          className="pill-nav"
          style={{ pointerEvents: "auto" }}
        >
          <button onClick={() => scrollToTop()} className="logo" aria-label="Back to top">
            <img src={logoSrc} alt="Logo" className="logo-img" style={{ transition: "opacity .45s ease" }} />
          </button>
          <span className="pill-divider" />

          {/* Magnetic links group */}
          <div ref={linksRef} className="nav-links-group" onMouseLeave={handleLinksLeave}>
            <span
              className="nav-magnetic-bubble"
              style={{
                left: bubble.left,
                width: bubble.width,
                opacity: bubble.visible ? 1 : 0,
              }}
            />
            {LINKS.map(l => <NavLink key={l.href} l={l} />)}
          </div>

          <span className="pill-divider" />
          <ThemeToggle />
          <span className="pill-divider" />
          <button className="btn btn-primary btn-sm" onClick={() => scrollTo("contact")}>
            Connect <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </motion.nav>
      </header>

      {/* ── DOT NAVIGATION ── */}
      <DotNav />

      {/* ── MOBILE ── */}
      <header className="md:hidden">
        <div className="mobile-nav">
          <button onClick={() => scrollToTop()} className="logo" aria-label="Back to top">
            <img src={logoSrc} alt="Logo" className="logo-img logo-img--sm" style={{ transition: "opacity .45s ease" }} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ThemeToggle size="sm" />
            <button
              onClick={() => setOpen(!open)}
              className="btn btn-ghost btn-sm"
              style={{ padding: "8px 14px" }}
              aria-label="Toggle menu"
            >
              {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: .24, ease: [.22, 1, .36, 1] }}
              className="mobile-menu-overlay"
            >
              <button
                onClick={() => setOpen(false)}
                className="btn btn-ghost"
                style={{ position: "absolute", top: 20, right: 20, padding: "8px 14px" }}
              >
                <X className="w-4 h-4" />
              </button>

              {LINKS.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: .28, ease: [.22, 1, .36, 1] }}
                >
                  <NavLink l={l} mobile onClick={() => setOpen(false)} />
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: .28 }}
                style={{ marginTop: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}
              >
                <button className="btn btn-primary" onClick={() => scrollTo("contact", true)}>
                  Connect <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
