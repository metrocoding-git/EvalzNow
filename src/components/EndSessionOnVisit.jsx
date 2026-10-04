"use client";

import { useEffect } from "react";
import { getToken, logout } from "@/lib/auth";

/**
 * Renders nothing. Placed on public pages (home page): if the user arrives here
 * while still signed in (e.g. pressed Back out of the app, or clicked the site logo),
 * the session is ended on the server and in every open tab.
 */
export default function EndSessionOnVisit() {
  useEffect(() => {
    if (getToken()) logout({ redirect: false });
  }, []);
  return null;
}
