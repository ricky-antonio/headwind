import Image from 'next/image'
import SiteHeader from './SiteHeader'

export default function Hero() {
  return (
    <div className="relative min-h-[620px] flex flex-col">
      {/* Background image */}
      <Image
        src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1920&q=80"
        alt="Airplane wing above clouds"
        fill
        priority
        className="object-cover"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      {/* Header sits on top of the image */}
      <SiteHeader transparent />

      {/* Hero content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pb-28 pt-10">
        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-white/20">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Powered by real flight data + AI
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-4 max-w-3xl">
          Know before<br className="hidden sm:block" /> you fly.
        </h1>

        <p className="text-lg sm:text-xl text-white/80 max-w-xl leading-relaxed">
          Check the delay risk for any flight route before you book.
          Historical data meets AI — so you can plan with confidence.
        </p>
      </div>
    </div>
  )
}
