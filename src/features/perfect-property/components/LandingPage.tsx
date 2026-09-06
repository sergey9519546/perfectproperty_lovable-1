import { useEffect, useState } from 'react'
import { Header } from './landing/Header'
import { Hero } from './landing/Hero'
import { SocialProof } from './landing/SocialProof'
import { Storyteller } from './landing/Storyteller'
import { MarketContext as AIKnows } from './landing/MarketContext'
import { Features as FastestWay } from './landing/Features'
import { GTMSection } from './landing/GTMSection'
import { Footer } from './landing/Footer'

export interface LandingPageProps {
  onExplore: (query?: string, mode?: 'Deals' | 'Shadow') => void
  onSignIn: () => void
}

/**
 * LandingPage component for Perfect Property.
 * Incorporates the Header, Hero (with blue blob), Social Proof, Storyteller,
 * AI Knows, Fastest Way, GTM sections, and Footer, adhering to design tokens.
 */
export function LandingPage({ onExplore, onSignIn }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleGenericExplore = () => {
    onExplore()
  }

  return (
    <div 
      id="perfect-property-landing"
      className="min-h-screen bg-white text-[#0F172A] selection:bg-[#2F5FFF]/20 selection:text-[#2F5FFF] font-sans antialiased"
    >
      {/* 1. Header Navigation */}
      <Header 
        scrolled={scrolled} 
        onSignIn={onSignIn} 
        onExplore={handleGenericExplore} 
      />

      <main id="landing-main-content">
        {/* 2. Hero with signature radial blue blob */}
        <Hero onExplore={onExplore} />

        {/* 3. Social Proof & Quantitative Institutional Traction */}
        <SocialProof />

        {/* 4. Storyteller Interactive Underwriting Showcase */}
        <Storyteller />

        {/* 5. AI Knows: Parcels & Market Context */}
        <AIKnows />

        {/* 6. Fastest Way: Features and Deal Story Workflow */}
        <FastestWay />

        {/* 7. GTM Sections: Ecosystem Integrations, Enterprise Readiness, & Conversion CTA */}
        <GTMSection onExplore={handleGenericExplore} />
      </main>

      {/* 8. Footer */}
      <Footer />
    </div>
  )
}
