"use client";

import { signOut, useSession } from "next-auth/react";

function initials(name: string | null | undefined, email: string | null | undefined) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "?";
}

export function UserAvatar() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="mt-auto border-t border-white/20 p-3 text-xs text-white/70">
        …
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const { user } = session;
  const label = initials(user.name, user.email);

  return (
    <div className="mt-auto border-t border-white/20 p-3">
      <div className="flex items-center gap-2">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-semibold"
          aria-hidden
        >
          {user.image ? (
            // Avatare können beliebige HTTPS-Hosts haben — kein festes remotePattern.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt=""
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            label
          )}
        </div>
        <div className="min-w-0 flex-1 text-xs">
          <div className="truncate font-medium">{user.name ?? user.email}</div>
          <div className="truncate text-white/70">{user.email}</div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="mt-2 w-full rounded bg-white/10 px-2 py-1.5 text-xs font-medium hover:bg-white/20"
      >
        Abmelden
      </button>
    </div>
  );
}
