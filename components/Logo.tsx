export function Logo() {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="url(#gradient)" />
      <path d="M30 30 L45 25 L55 35 L70 30 L65 45 L75 55 L70 70 L55 65 L45 75 L30 70 L35 55 L25 45 L30 30 Z" 
            stroke="white" strokeWidth="2" fill="none" />
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8A5CF6" />
          <stop offset="100%" stopColor="#67E8F9" />
        </linearGradient>
      </defs>
    </svg>
  )
}