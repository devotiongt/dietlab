import {
  NavigationHeader,
  HeroSection,
  FeaturesSection,
  BenefitsSection,
  Footer
} from './landing'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <NavigationHeader />
      <HeroSection />
      <FeaturesSection />
      <BenefitsSection />
      <Footer />
    </div>
  )
}