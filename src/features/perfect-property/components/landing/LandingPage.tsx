import { TailarkHero } from './TailarkHero';
import { TailarkIntegrations } from './TailarkIntegrations';
import { TailarkBentoFeatures } from './TailarkBentoFeatures';
import { TailarkInteractiveTerminal } from './TailarkInteractiveTerminal';
import { TailarkTestimonials } from './TailarkTestimonials';
import { TailarkCTA } from './TailarkCTA';
import { TailarkFooter } from './TailarkFooter';

export interface LandingPageProps {
  onExplore: (query?: string, mode?: "Deals" | "Shadow") => void;
  onSignIn: () => void;
}

export function LandingPage({ onExplore }: LandingPageProps) {
  return (
    <div
      id="perfect-property-tailark-landing-root"
      className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary/20 selection:text-primary"
    >
      <div id="tailark-landing-content">
        <TailarkHero onExplore={onExplore} />
        <TailarkIntegrations />
        <TailarkBentoFeatures />
        <TailarkInteractiveTerminal onExplore={onExplore} />
        <TailarkTestimonials />
        <TailarkCTA onExplore={() => onExplore()} />
      </div>
      <TailarkFooter />
    </div>
  );
}

