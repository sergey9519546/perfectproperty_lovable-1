export const IntegrationBar = () => {
  return (
    <section className="py-24 bg-card border-t border-accent">
      <div className="max-w-[1200px] mx-auto px-6 text-center">
        <h3 className="text-[12px] font-bold text-muted-foreground uppercase tracking-[0.25em] mb-16">
          Seamlessly connected to your data stack
        </h3>
        <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-12 grayscale opacity-40 hover:opacity-60 transition-opacity">
          {['Salesforce', 'Hubspot', 'Slack', 'Zillow', 'Redfin', 'CountyGov', 'Stripe', 'GoogleDrive'].map(i => (
            <span key={i} className="text-2xl font-black tracking-tighter uppercase text-foreground">{i}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
