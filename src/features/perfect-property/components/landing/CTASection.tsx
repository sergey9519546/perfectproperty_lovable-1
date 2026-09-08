import { Button } from "@/components/ui/button";
import { motion } from 'motion/react'

export const CTASection = ({ onExplore }: { onExplore: () => void }) => {
  return (
    <section className="py-32 bg-background text-white overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-[-50%] left-[-10%] right-[-10%] h-[150%] bg-[radial-gradient(circle_at_center,_#efaa2d_0%,_transparent_70%)] blur-[100px]" />
      </div>
      
      <div className="max-w-[1200px] mx-auto px-6 text-center relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[48px] md:text-[64px] font-bold tracking-[-0.04em] leading-[1.05] mb-8 max-w-[800px] mx-auto"
        >
          Ready to find your next perfect property?
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-[20px] text-white/60 mb-12 max-w-[600px] mx-auto font-medium"
        >
          Join thousands of investors using AI to surface off-market deals and automate their underwriting.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button 
            onClick={onExplore}
            className="h-14 px-10 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 w-full sm:w-auto cursor-pointer"
          >
            Sign up for free
          </Button>
          <Button className="h-14 px-10 bg-card/10 text-white rounded-xl font-bold hover:bg-card/20 backdrop-blur-sm transition-all w-full sm:w-auto cursor-pointer">
            Talk to sales
          </Button>
        </motion.div>
        <p className="mt-8 text-[14px] text-white/40 font-medium">
          Free forever for individual investors. No credit card required.
        </p>
      </div>
    </section>
  )
}
