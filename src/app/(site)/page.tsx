import { Suspense } from "react";
import { Stage } from "../../components/stage/Stage";
import { AppShell } from "../../components/stage/AppShell";

export default function Home() {
  // AppShell (Lenis + the tall scroll track) belongs to the scene-driven home page only —
  // wrapping other routes in it pushes their content far below the fold.
  // Suspense: framer-motion's AnimatePresence uses Math.random(), which
  // Cache Components won't allow in the static prerender.
  return (
    <AppShell>
      <Suspense fallback={null}>
        <Stage />
      </Suspense>
    </AppShell>
  );
}
