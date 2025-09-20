'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Shield, Zap, Users } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

const MissionSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const { theme } = useTheme()

  const missionCards = [
    {
      icon: Shield,
      title: "A secure purchase",
      description: "Complete transparency, the right information to understand everything and training to feel ready to operate."
    },
    {
      icon: Zap,
      title: "Streamlined procedures",
      description: "With online tools and a redesigned journey for today's entrepreneurs."
    },
    {
      icon: Users,
      title: "Unwavering proximity",
      description: "Advisors who are 100% with you, available, and of course, in line with your project."
    }
  ]

  return (
    <section ref={ref} className={`py-20 ${
      theme === 'dark' ? 'bg-dark-secondary' : 'bg-phamily-lightGray'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
            theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
          }`}>
            Our mission
          </h2>
          <h3 className={`text-3xl md:text-4xl font-bold mb-8 ${
            theme === 'dark' ? 'text-dark-text' : 'text-phamily-blue'
          }`}>
            Your business
            <span className={`block ${
              theme === 'dark' ? 'text-dark-textSecondary' : 'text-phamily-orange'
            }`}>peace of mind</span>
          </h3>
        </motion.div>

        {/* Mission Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {missionCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className={`rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 btn-hover ${
                theme === 'dark' ? 'bg-dark-primary' : 'bg-white'
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  theme === 'dark' ? 'bg-dark-text' : 'bg-phamily-blue'
                }`}>
                  <card.icon className={`w-8 h-8 ${
                    theme === 'dark' ? 'text-dark-primary' : 'text-white'
                  }`} />
                </div>
                <h4 className={`text-xl font-bold ${
                  theme === 'dark' ? 'text-dark-text' : 'text-phamily-darkGray'
                }`}>
                  {card.title}
                </h4>
                <p className={`leading-relaxed ${
                  theme === 'dark' ? 'text-dark-textSecondary' : 'text-phamily-darkGray/80'
                }`}>
                  {card.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default MissionSection
