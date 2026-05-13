import Image from 'next/image'

const steps = [
  {
    number: '01',
    icon: '🗺️',
    title: 'Enter your route',
    description: 'Pick your origin, destination, airline, and travel date. Takes seconds.',
    image: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=600&q=80',
    alt: 'City lights from airplane at night',
  },
  {
    number: '02',
    icon: '📊',
    title: 'We analyze the data',
    description: 'We pull 7 days of real historical departure records and crunch the numbers.',
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80',
    alt: 'Airport terminal',
  },
  {
    number: '03',
    icon: '✅',
    title: 'Get your verdict',
    description: 'Receive a LOW / MODERATE / HIGH risk score with AI-generated tips tailored to your route.',
    image: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?auto=format&fit=crop&w=600&q=80',
    alt: 'Airplane in flight',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-20 px-6 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold tracking-tight mb-3">How it works</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            No guesswork. No vibes. Just data-driven insight on whether your flight is likely to leave on time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="group rounded-2xl overflow-hidden border bg-card shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={step.image}
                  alt={step.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className="absolute bottom-3 left-4 text-white font-mono text-xs font-bold opacity-70">
                  {step.number}
                </span>
              </div>
              <div className="p-5">
                <div className="text-2xl mb-2">{step.icon}</div>
                <h3 className="font-semibold text-base mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats strip */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center animate-fade-in [animation-delay:500ms]">
          {[
            { value: '130+', label: 'Airports covered' },
            { value: '50+', label: 'Airlines tracked' },
            { value: '7 days', label: 'Historical data window' },
            { value: '~15s', label: 'Time to your result' },
          ].map(stat => (
            <div key={stat.label}>
              <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
