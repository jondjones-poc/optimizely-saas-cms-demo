'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

const HeroSection = () => {
  const { theme } = useTheme()
  
  return (
    <section className={`relative min-h-screen flex items-center justify-center overflow-hidden ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-accent'
        : 'bg-gradient-to-br from-phamily-blue via-phamily-lightBlue to-phamily-orange'
    }`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className={`absolute top-20 left-20 w-32 h-32 rounded-full animate-float ${
          theme === 'dark' ? 'bg-dark-text' : 'bg-white'
        }`}></div>
        <div className={`absolute top-40 right-32 w-24 h-24 rounded-full animate-float ${
          theme === 'dark' ? 'bg-dark-text' : 'bg-white'
        }`} style={{ animationDelay: '1s' }}></div>
        <div className={`absolute bottom-32 left-40 w-20 h-20 rounded-full animate-float ${
          theme === 'dark' ? 'bg-dark-text' : 'bg-white'
        }`} style={{ animationDelay: '2s' }}></div>
        <div className={`absolute bottom-20 right-20 w-28 h-28 rounded-full animate-float ${
          theme === 'dark' ? 'bg-dark-text' : 'bg-white'
        }`} style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`text-lg md:text-xl font-medium ${
              theme === 'dark' ? 'text-dark-text/90' : 'text-white/90'
            }`}
          >
            Lorem ipsum dolor sit amet consectetur
          </motion.p>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className={`text-4xl md:text-6xl lg:text-7xl font-bold leading-tight ${
              theme === 'dark' ? 'text-dark-text' : 'text-white'
            }`}
          >
            <span className="block">Lorem ipsum</span>
            <span className={`block ${
              theme === 'dark' ? 'text-dark-textSecondary' : 'text-phamily-orange'
            }`}>dolor sit amet</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed ${
              theme === 'dark' ? 'text-dark-text/80' : 'text-white/80'
            }`}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
          >
            <button className={`px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 btn-hover flex items-center gap-2 ${
              theme === 'dark'
                ? 'bg-dark-text text-dark-primary hover:bg-dark-textSecondary'
                : 'bg-white text-phamily-blue hover:bg-phamily-lightGray'
            }`}>
              I am a buyer
              <ArrowRight size={20} />
            </button>
            <button className={`border-2 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 btn-hover flex items-center gap-2 ${
              theme === 'dark'
                ? 'border-dark-text text-dark-text hover:bg-dark-text hover:text-dark-primary'
                : 'border-white text-white hover:bg-white hover:text-phamily-blue'
            }`}>
              I am a seller
              <Play size={20} />
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`w-6 h-10 border-2 rounded-full flex justify-center ${
            theme === 'dark' ? 'border-dark-text' : 'border-white'
          }`}
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`w-1 h-3 rounded-full mt-2 ${
              theme === 'dark' ? 'bg-dark-text' : 'bg-white'
            }`}
          />
        </motion.div>
      </motion.div>
    </section>
  )
}

export default HeroSection
