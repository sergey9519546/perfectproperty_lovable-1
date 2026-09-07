import { useState, useEffect } from 'react'
import { Header } from './Header'
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
      className="min-h-screen bg-white text-[#0F172A] font-sans antialiased selection:bg-blue-100 selection:text-blue-900"
    >
      <Header scrolled={scrolled} onSignIn={onSignIn} onExplore={() => onExplore()} />
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
