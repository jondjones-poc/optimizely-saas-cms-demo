import Navigation from '@/components/Navigation'
import HeroSection from '@/components/HeroSection'
import Carousel from '@/components/Carousel'
import MissionSection from '@/components/MissionSection'
import SolutionSection from '@/components/SolutionSection'
import CommunitySection from '@/components/CommunitySection'
import TeamSection from '@/components/TeamSection'
import Footer from '@/components/Footer'
import ThemeTest from '@/components/ThemeTest'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <ThemeTest />
      <HeroSection />
      <Carousel />
      <MissionSection />
      <SolutionSection />
      <CommunitySection />
      <TeamSection />
      <Footer />
    </main>
  )
}
