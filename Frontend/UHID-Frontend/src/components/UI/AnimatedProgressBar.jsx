import { motion, useInView } from "framer-motion";
import { useRef } from "react";

function AnimatedProgressBar({ value = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const safeValue = Math.max(0, Math.min(100, value));
  const isHigh = safeValue >= 80;

  return (
    <div
      ref={ref}
      className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner"
    >
      {/* Width Animation Wrapper */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: isInView ? `${safeValue}%` : 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative h-full rounded-full overflow-hidden"
      >
        {/* Base Purple Gradient */}
        <div className="absolute inset-0 bg-linear-to-r from-purple-600 to-indigo-500" />

        {/* Green Gradient Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isInView && isHigh ? 1 : 0 }}
          transition={{ duration: 0.8, ease: "easeInOut", delay: 0.6 }}
          className="absolute inset-0 bg-linear-to-r from-emerald-500 to-green-400"
        />

        {/* Subtle Glow */}
        <div className="absolute inset-0 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.35)] pointer-events-none" />
      </motion.div>
    </div>
  );
}

export default AnimatedProgressBar;