'use client'

import Navigation from '@/components/Navigation'
import CustomHeader from '@/components/CustomHeader'
import SolutionSection from '@/components/SolutionSection'
import CommunitySection from '@/components/CommunitySection'
import TeamSection from '@/components/TeamSection'
import Footer from '@/components/Footer'
import CustomFooter from '@/components/CustomFooter'
import RightFloatingMenuComponent from '@/components/RightFloatingMenuComponent'

export default function Components() {
  return (
    <main className="min-h-screen">
      <CustomHeader />
      <Navigation 
        optimizelyData={null} 
        isLoading={false} 
        error={null}
      />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-phamily-blue to-phamily-lightBlue text-white">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Transform Your Business
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Discover the power of our comprehensive SaaS platform designed to streamline your operations and accelerate growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-phamily-blue rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors duration-300">
              Get Started
            </button>
            <button className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-phamily-blue transition-colors duration-300">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-phamily-darkGray mb-6">
              Welcome to Optimizely
            </h2>
            <p className="text-lg text-phamily-darkGray/80 max-w-3xl mx-auto">
              Experience the future of content management with our cutting-edge platform designed for modern businesses.
            </p>
          </div>
        </div>
      </section>

      {/* Demo Banner 1 */}
      <section className="py-16 bg-phamily-lightGray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-phamily-darkGray mb-4">
              Demo Banner 1
            </h3>
            <p className="text-lg text-phamily-darkGray/80">
              This is a static demo banner with margin controls.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-20 bg-phamily-lightGray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-phamily-darkGray mb-6">
              Our mission
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold text-phamily-blue mb-8">
              Your business
              <span className="block text-phamily-orange">peace of mind</span>
            </h3>
            <p className="text-lg text-phamily-darkGray/80 max-w-3xl mx-auto">
              We provide comprehensive solutions that give you complete confidence in your business operations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-phamily-blue rounded-full flex items-center justify-center mb-6">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h4 className="text-2xl font-bold text-phamily-darkGray mb-4">
                Feature One
              </h4>
              <p className="text-phamily-darkGray/80">
                Comprehensive solution for your business needs with advanced features and reliable performance.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-phamily-blue rounded-full flex items-center justify-center mb-6">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h4 className="text-2xl font-bold text-phamily-darkGray mb-4">
                Feature Two
              </h4>
              <p className="text-phamily-darkGray/80">
                Streamlined processes that enhance productivity and deliver exceptional results for your organization.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-phamily-blue rounded-full flex items-center justify-center mb-6">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h4 className="text-2xl font-bold text-phamily-darkGray mb-4">
                Feature Three
              </h4>
              <p className="text-phamily-darkGray/80">
                Innovative technology that transforms your business operations and drives sustainable growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Banner 2 */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-phamily-darkGray mb-4">
              Demo Banner 2
            </h3>
            <p className="text-lg text-phamily-darkGray/80">
              Another static demo banner with different styling.
            </p>
          </div>
        </div>
      </section>

      {/* Carousel Section */}
      <section className="relative h-[600px] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=600&fit=crop)' }}>
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="flex justify-end">
              <div className="max-w-lg p-8 rounded-2xl backdrop-blur-sm bg-white/90">
                <p className="text-sm font-medium mb-2 text-phamily-blue">
                  Innovation at Scale
                </p>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-phamily-darkGray">
                  Transform Your Business
                </h2>
                <p className="text-lg mb-6 leading-relaxed text-phamily-darkGray/80">
                  Discover the power of our comprehensive SaaS platform designed to streamline your operations and accelerate growth.
                </p>
                <button className="px-6 py-3 rounded-full font-semibold transition-all duration-300 btn-hover bg-phamily-blue text-white hover:bg-phamily-lightBlue">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center rounded-2xl p-12 bg-phamily-lightGray">
            <h4 className="text-3xl font-bold mb-6 text-phamily-darkGray">
              So this project, shall we talk about it?
            </h4>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 btn-hover bg-phamily-blue text-white hover:bg-phamily-lightBlue flex items-center justify-center gap-2">
                Get Started
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button className="px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 btn-hover border-2 border-phamily-blue text-phamily-blue hover:bg-phamily-blue hover:text-white flex items-center justify-center gap-2">
                Learn More
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      <SolutionSection />
      <CommunitySection />
      <TeamSection />
      <div className="mb-16"></div>
      <Footer />
      <CustomFooter 
        optimizelyData={null} 
        isLoading={false} 
        error={null} 
      />
      
      {/* Sidebar Components */}
      <RightFloatingMenuComponent />
    </main>
  )
}
