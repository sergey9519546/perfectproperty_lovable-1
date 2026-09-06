import { motion } from 'motion/react'
import { ArrowRight, Database, Server, Webhook, Zap, CheckCircle2 } from 'lucide-react'
import { IntegrationBar } from './IntegrationBar'
import { CTASection } from './CTASection'

const enterprisePoints = [
  {
    icon: Database,
    title: 'Cadastral GIS Engine',
    desc: 'Sub-400ms spatial indexing across parcel polygons, deed histories, and county tax liens.',
  },
  {
    icon: Webhook,
    title: 'Instant CRM & Webhook Sync',
    desc: 'Auto-export high-margin opportunities directly to Podio, HubSpot, or Salesforce workflows.',
  },
  {
    icon: Server,
    title: 'Nightly Ingestion Pipelines',
    desc: 'Scrapy + Zyte crawler pipelines parse auction dockets, lis pendens, and probate notices daily.',
  },
  {
    icon: Zap,
    title: 'Institutional Underwriting API',
    desc: 'REST endpoints and exportable PDF memos calibrated against actual closed comp datasets.',
  },
]

export const GTMSection = ({ onExplore }: { onExplore: () => void }) => {
  return (
    <div id="gtm-sections" className="flex flex-col">
      {/* Integrations Bar */}
      <IntegrationBar />

      {/* Enterprise GTM & Data Architecture Section */}
      <section className="py-28 bg-[#0B0F17] text-white relative overflow-hidden border-t border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(47,95,255,0.15),rgba(255,255,255,0))]" />

        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
                <span>Enterprise GTM Architecture</span>
              </div>
              <h2 className="text-[36px] sm:text-[46px] font-bold tracking-[-0.03em] leading-[1.1] mb-6 text-white">
                Engineered for serious acquisition desks & fund velocity
              </h2>
              <p className="text-[17px] text-slate-400 leading-[1.6] font-medium max-w-[500px]">
                Whether you analyze five distressed properties a week or scale a 1,000-parcel fund portfolio, Perfect Property handles ingestion, underwriting, and compliance automatically.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onExplore}
                  className="h-12 px-7 bg-[#2F5FFF] hover:bg-[#2555FF] text-white text-[14px] font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Explore Deal Engine</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {enterprisePoints.map((item, i) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="p-6 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.06] transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                      <Icon size={20} />
                    </div>
                    <h3 className="text-[16px] font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-[13px] text-slate-400 leading-relaxed font-medium">{item.desc}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main High-Conversion CTA */}
      <CTASection onExplore={onExplore} />
    </div>
  )
}
