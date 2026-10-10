"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import "./PointerAtmosphere.css";

const FluidCursor = lazy(() => import("./FluidCursor"));

/** A single shared layer also covers portalled desktop windows and journal routes. */
export default function PointerAtmosphere() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(any-hover: hover) and (any-pointer: fine)");
    const update = () => setEnabled(!reduce.matches && fine.matches);
    update();
    reduce.addEventListener("change", update);
    fine.addEventListener("change", update);
    return () => {
      reduce.removeEventListener("change", update);
      fine.removeEventListener("change", update);
    };
  }, []);
  return enabled ? <Suspense fallback={null}><FluidCursor /></Suspense> : null;
}
