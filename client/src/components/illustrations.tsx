// NetworkGraph illustration for Learning Paths page
export function NetworkGraphIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 420 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* ping rings */}
      <circle cx="210" cy="180" r="30" stroke="#20dcbe" strokeWidth="0.5" opacity="0.3"/>
      <circle cx="210" cy="180" r="55" stroke="#20dcbe" strokeWidth="0.3" opacity="0.15"/>
      <circle cx="210" cy="180" r="80" stroke="#20dcbe" strokeWidth="0.2" opacity="0.08"/>

      {/* edges */}
      <line x1="210" y1="180" x2="80" y2="90" stroke="#22c55e" strokeWidth="0.8" strokeDasharray="4 3" opacity="0.6"/>
      <line x1="210" y1="180" x2="340" y2="80" stroke="#e24b4a" strokeWidth="0.8" strokeDasharray="4 3" opacity="0.6"/>
      <line x1="210" y1="180" x2="60" y2="270" stroke="#22c55e" strokeWidth="0.8" strokeDasharray="4 3" opacity="0.6"/>
      <line x1="210" y1="180" x2="360" y2="260" stroke="#e24b4a" strokeWidth="0.8" strokeDasharray="4 3" opacity="0.6"/>
      <line x1="210" y1="180" x2="380" y2="170" stroke="#22c55e" strokeWidth="0.8" strokeDasharray="4 3" opacity="0.5"/>
      <line x1="210" y1="180" x2="40" y2="170" stroke="#e24b4a" strokeWidth="0.8" strokeDasharray="4 3" opacity="0.5"/>
      <line x1="80" y1="90" x2="150" y2="55" stroke="#8b78e6" strokeWidth="0.6" strokeDasharray="3 4" opacity="0.4"/>
      <line x1="340" y1="80" x2="380" y2="170" stroke="#e24b4a" strokeWidth="0.6" strokeDasharray="3 4" opacity="0.4"/>
      <line x1="60" y1="270" x2="280" y2="305" stroke="#8b78e6" strokeWidth="0.6" strokeDasharray="3 4" opacity="0.4"/>
      <line x1="360" y1="260" x2="280" y2="305" stroke="#8b78e6" strokeWidth="0.6" strokeDasharray="3 4" opacity="0.4"/>
      <line x1="40" y1="170" x2="60" y2="270" stroke="#22c55e" strokeWidth="0.6" strokeDasharray="3 4" opacity="0.4"/>

      {/* center node */}
      <circle cx="210" cy="180" r="18" stroke="#20dcbe" strokeWidth="1.5" opacity="0.8"/>
      <circle cx="210" cy="180" r="6" fill="#20dcbe" opacity="0.9"/>

      {/* outer nodes */}
      <circle cx="80" cy="90" r="12" stroke="#22c55e" strokeWidth="1" opacity="0.7"/>
      <circle cx="80" cy="90" r="4" fill="#22c55e" opacity="0.8"/>

      <circle cx="340" cy="80" r="12" stroke="#e24b4a" strokeWidth="1" opacity="0.7"/>
      <circle cx="340" cy="80" r="4" fill="#e24b4a" opacity="0.8"/>

      <circle cx="60" cy="270" r="10" stroke="#22c55e" strokeWidth="1" opacity="0.6"/>
      <circle cx="60" cy="270" r="3" fill="#22c55e" opacity="0.7"/>

      <circle cx="360" cy="260" r="10" stroke="#e24b4a" strokeWidth="1" opacity="0.6"/>
      <circle cx="360" cy="260" r="3" fill="#e24b4a" opacity="0.7"/>

      <circle cx="380" cy="170" r="8" stroke="#22c55e" strokeWidth="1" opacity="0.5"/>
      <circle cx="380" cy="170" r="3" fill="#22c55e" opacity="0.6"/>

      <circle cx="40" cy="170" r="8" stroke="#e24b4a" strokeWidth="1" opacity="0.5"/>
      <circle cx="40" cy="170" r="3" fill="#e24b4a" opacity="0.6"/>

      <circle cx="150" cy="55" r="6" stroke="#8b78e6" strokeWidth="1" opacity="0.5"/>
      <circle cx="150" cy="55" r="2" fill="#8b78e6" opacity="0.6"/>

      <circle cx="280" cy="305" r="6" stroke="#8b78e6" strokeWidth="1" opacity="0.5"/>
      <circle cx="280" cy="305" r="2" fill="#8b78e6" opacity="0.6"/>
    </svg>
  );
}

// Radar illustration for Challenges page
export function RadarIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 360 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* concentric circles */}
      <circle cx="180" cy="180" r="140" stroke="#e24b4a" strokeWidth="0.5" opacity="0.15"/>
      <circle cx="180" cy="180" r="105" stroke="#e24b4a" strokeWidth="0.5" opacity="0.2"/>
      <circle cx="180" cy="180" r="70" stroke="#e24b4a" strokeWidth="0.8" opacity="0.25"/>
      <circle cx="180" cy="180" r="35" stroke="#e24b4a" strokeWidth="0.8" opacity="0.3"/>

      {/* cross hairs */}
      <line x1="180" y1="20" x2="180" y2="340" stroke="#e24b4a" strokeWidth="0.4" opacity="0.15"/>
      <line x1="20" y1="180" x2="340" y2="180" stroke="#e24b4a" strokeWidth="0.4" opacity="0.15"/>
      <line x1="81" y1="81" x2="279" y2="279" stroke="#e24b4a" strokeWidth="0.3" opacity="0.1"/>
      <line x1="279" y1="81" x2="81" y2="279" stroke="#e24b4a" strokeWidth="0.3" opacity="0.1"/>

      {/* radar sweep */}
      <path d="M180 180 L180 40 A140 140 0 0 1 299 251 Z" fill="#e24b4a" opacity="0.04"/>
      <line x1="180" y1="180" x2="299" y2="251" stroke="#e24b4a" strokeWidth="1" opacity="0.4"/>
      <line x1="180" y1="180" x2="180" y2="40" stroke="#e24b4a" strokeWidth="0.6" opacity="0.3"/>

      {/* blips */}
      <circle cx="240" cy="110" r="4" fill="#e24b4a" opacity="0.8"/>
      <circle cx="240" cy="110" r="8" stroke="#e24b4a" strokeWidth="0.8" opacity="0.4"/>
      <circle cx="240" cy="110" r="14" stroke="#e24b4a" strokeWidth="0.4" opacity="0.2"/>

      <circle cx="130" cy="230" r="3" fill="#f59e0b" opacity="0.7"/>
      <circle cx="130" cy="230" r="7" stroke="#f59e0b" strokeWidth="0.6" opacity="0.3"/>

      <circle cx="270" cy="200" r="2" fill="#e24b4a" opacity="0.5"/>
      <circle cx="270" cy="200" r="5" stroke="#e24b4a" strokeWidth="0.5" opacity="0.25"/>

      {/* center dot */}
      <circle cx="180" cy="180" r="4" fill="#e24b4a" opacity="0.9"/>
      <circle cx="180" cy="180" r="8" stroke="#e24b4a" strokeWidth="1" opacity="0.5"/>
    </svg>
  );
}
