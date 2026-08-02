"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { SITE_TITLE } from "@/lib/content";

const links = [
  { href: "/", label: "Início" },
  { href: "/bills", label: "Projetos de Lei" },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-5">
      <Link
        href="/"
        className={`text-md transition-colors ${
          pathname === "/" ? "font-bold text-foreground" : "hover:text-primary"
        }`}
      >
        {SITE_TITLE}
      </Link>
      {links.slice(1).map(({ href, label }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`text-md transition-colors ${
              active
                ? "font-bold text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
