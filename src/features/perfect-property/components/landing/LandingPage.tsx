import { useState, useEffect } from 'react'
import { Hero } from './Hero'
import { SocialProof } from './SocialProof'
import { Storyteller } from './Storyteller'
import { MarketContext } from './MarketContext'
import { Features } from './Features'
import { GTMSection } from './GTMSection'
import { Footer } from './Footer'

export interface LandingPageProps {
  onExplore: (query?: string, mode?: "Deals" | "Shadow") => void;
  onSignIn: () => void;
}

export function LandingPage({ onExplore, onSignIn }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      id="perfect-property-light-landing-root"
      className="min-h-screen bg-card text-foreground font-sans antialiased selection:bg-primary/20 selection:text-primary"
    >
            <main id="light-landing-main">
        <Hero onExplore={onExplore} />
        <SocialProof />
        <Storyteller />
        <MarketContext />
        <Features />
        <GTMSection onExplore={() => onExplore()} />
      </main>
      <Footer />
    </div>
  );
}
