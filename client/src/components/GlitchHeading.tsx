import { motion } from "framer-motion";

export function GlitchHeading({ text, className = "" }: { text: string; className?: string }) {
  return (
    <div className={`relative inline-block group ${className}`}>
      <motion.h1 
        className="relative z-10 font-bold"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {text}
      </motion.h1>
      <div className="absolute top-0 left-0 -z-10 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-100 select-none pointer-events-none">
        <span className="absolute top-[1px] left-[1px] w-full h-full text-red-500/50 animate-pulse">{text}</span>
        <span className="absolute -top-[1px] -left-[1px] w-full h-full text-blue-500/50 animate-pulse delay-75">{text}</span>
      </div>
    </div>
  );
}
