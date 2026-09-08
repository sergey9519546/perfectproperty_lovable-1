import { motion } from 'motion/react'
import { Star, ShieldCheck, TrendingUp, Clock, CheckCircle2, Quote } from 'lucide-react'

const stats = [
  {
    value: '$420M+',
    label: 'Deal volume underwritten',
    detail: 'Across institutional & private portfolios',
    icon: TrendingUp,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    value: '1,268',
    label: 'Live distressed parcels',
    detail: 'Indexed with cadastral deed boundaries',
    icon: ShieldCheck,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    value: '6 min',
    label: 'Memo generation turnaround',
    detail: 'Instant automated ARV & skepticism checks',
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    value: '94.2%',
    label: 'Backtested ARV accuracy',
    detail: 'Within ±8% of final closed sales comps',
    icon: CheckCircle2,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
]

const testimonials = [
  {
    quote:
      'We replaced three analysts manually pulling county recorder files. Perfect Property surfaced our best off-market flip in Cook County before it appeared on any public radar.',
    author: 'Marcus Vance',
    role: 'Managing Director, Apex Capital Acquisitions',
    location: 'Chicago, IL',
    metric: '14 deals acquired in 2025',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  },
  {
    quote:
      'The cadastral parcel boundaries and automated ARV skepticism saved us from an estimated $65,000 unpermitted foundation error on our very first week of using the workspace.',
    author: 'Elena Rodriguez',
    role: 'Principal, UrbanCore Capital & Flips',
    location: 'Miami, FL',
    metric: '+$340k saved in distressed traps',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
  },
  {
    quote:
      'Lenders and private equity partners treat our deal memos like Goldman Sachs research. Every figure traces directly back to county deed provenance and actual closed comps.',
    author: 'David Sterling',
    role: 'Head of Acquisitions, Sterling Property Group',
    location: 'Los Angeles, CA',
    metric: '3.2x faster capital approval',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  },
]

export const SocialProof = () => {
  return (
    <section id="social-proof-section" className="py-24 bg-card border-y border-border relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Rating & Trust Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card border border-slate-200 shadow-sm text-secondary-foreground text-xs font-semibold uppercase tracking-wider mb-4"
          >
            <div className="flex items-center text-amber-500 gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={13} fill="currentColor" />
              ))}
            </div>
            <span className="text-foreground font-bold">4.9 / 5.0</span>
            <span className="text-slate-400 font-normal">|</span>
            <span>Institutional Real Estate Benchmark</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-[32px] sm:text-[40px] font-bold tracking-[-0.03em] text-foreground max-w-[680px]"
          >
            Trusted by active deal hunters & private equity funds
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-muted-foreground text-[16px] sm:text-[17px] max-w-[580px] mt-3 font-medium"
          >
            From solo fix-and-flippers to multi-county acquisition teams, see why real estate operators trust our cadastral intelligence engine.
          </motion.p>
        </div>

        {/* Quantified Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[32px] sm:text-[36px] font-extrabold tracking-tight text-foreground">
                    {stat.value}
                  </span>
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                    <Icon size={20} strokeWidth={2.2} />
                  </div>
                </div>
                <h3 className="text-[15px] font-bold text-foreground mb-1">{stat.label}</h3>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">{stat.detail}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Testimonials Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: idx * 0.15 }}
              className="bg-card rounded-2xl p-7 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group"
            >
              <div className="mb-6">
                <Quote className="w-8 h-8 text-primary/20 mb-3" />
                <p className="text-[15px] text-secondary-foreground leading-[1.6] font-medium italic">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.author}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="text-[14px] font-bold text-foreground leading-tight">{t.author}</h4>
                    <p className="text-xs text-muted-foreground font-medium">{t.role}</p>
                    <p className="text-[11px] text-slate-400">{t.location}</p>
                  </div>
                </div>
              </div>

              <div className="mt-3.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                <CheckCircle2 size={12} />
                <span>{t.metric}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
