'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight } from 'lucide-react'

const SolutionSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const solutionSteps = [
    {
      number: "01",
      title: "Personalized support for a solid project",
      description: "Buying and selling a business can be dizzying. SaaSCMS gives you the keys to be in control with dedicated regular meetings, analysis of your project, and much more."
    },
    {
      number: "02", 
      title: "Buy and sell without hassle",
      description: "With SaaSCMS, we are present at every step and scrupulously verify that everything is in order. No bad surprises along the way!"
    },
    {
      number: "03",
      title: "Coaching to feel comfortable from day 1",
      description: "Managing a team will be your daily life. Better to arrive prepared. SaaSCMS trains you with professionals to be comfortable in your business shoes."
    }
  ]

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-phamily-darkGray mb-6">
            Our solution
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold text-phamily-blue mb-8">
            A winner's journey.
            <span className="block text-phamily-orange">Not a fighter's</span>
          </h3>
          <button className="inline-flex items-center gap-2 text-phamily-blue font-semibold text-lg hover:text-phamily-orange transition-colors duration-300">
            Discover the concept
            <ArrowRight size={20} />
          </button>
        </motion.div>

        {/* Solution Steps */}
        <div className="space-y-16">
          {solutionSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              transition={{ duration: 0.8, delay: index * 0.3 }}
              className={`flex flex-col lg:flex-row items-center gap-12 ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Step Number */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-gradient-to-br from-phamily-blue to-phamily-lightBlue rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">{step.number}</span>
                </div>
              </div>

              {/* Step Content */}
              <div className="flex-1 text-center lg:text-left">
                <h4 className="text-2xl md:text-3xl font-bold text-phamily-darkGray mb-6">
                  {step.title}
                </h4>
                <p className="text-lg text-phamily-darkGray/80 leading-relaxed max-w-2xl">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center mt-20"
        >
          <button className="inline-flex items-center gap-2 text-phamily-blue font-semibold text-lg hover:text-phamily-orange transition-colors duration-300">
            Discover the concept
            <ArrowRight size={20} />
          </button>
        </motion.div>
      </div>
    </section>
  )
}

export default SolutionSection
