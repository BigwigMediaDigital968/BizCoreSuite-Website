import { Suspense } from "react";
import { Stage } from "./components/stage/Stage";

export default function Home() {
  // Suspense: framer-motion's AnimatePresence uses Math.random(), which
  // Cache Components won't allow in the static prerender.
  return (
    <Suspense fallback={null}>
      <Stage />
    </Suspense>
  );
}
