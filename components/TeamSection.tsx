'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Phone } from 'lucide-react'

const TeamSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const teamMembers = [
    {
      name: "Gloria",
      title: "Make your ambitions shine",
      phone: "01 21 38 69 71 73 74",
      regions: ["01", "21", "38", "69", "71", "73", "74"],
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face"
    },
    {
      name: "Guillaume", 
      title: "Surfer ascending entrepreneur",
      phone: "09 11 34 66",
      regions: ["09", "11", "34", "66"],
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face"
    },
    {
      name: "Loïc",
      title: "Business, it's life",
      phone: "03 15 42 43 63 69",
      regions: ["03", "15", "42", "43", "63", "69"],
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
    },
    {
      name: "Marie",
      title: "Towards quality and beyond!",
      phone: "12 30 31 48 81",
      regions: ["12", "30", "31", "48", "81"],
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face"
    },
    {
      name: "Stéphane",
      title: "Free to be yourself",
      phone: "06 83",
      regions: ["06", "83"],
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face"
    },
    {
      name: "Aude",
      title: "Human, above all!",
      phone: "2A 2B 04 05 07 13 26 84",
      regions: ["2A", "2B", "04", "05", "07", "13", "26", "84"],
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face"
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
            The family
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold text-phamily-blue mb-8">
            Here for you.
            <span className="block text-phamily-orange">Close to you.</span>
          </h3>
          <p className="text-lg text-phamily-darkGray/80 max-w-3xl mx-auto">
            From Lyon to Montpellier, via Nice and Marseille, the SaaSCMS advisors are close to you
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-phamily-lightGray rounded-2xl p-8 text-center hover:shadow-lg transition-all duration-300 btn-hover"
            >
              <div className="mb-6">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white shadow-lg"
                />
              </div>
              <h4 className="text-2xl font-bold text-phamily-darkGray mb-2">
                {member.name}
              </h4>
              <p className="text-phamily-blue font-medium mb-4">
                {member.title}
              </p>
              <div className="flex items-center justify-center gap-2 text-phamily-darkGray/80 mb-4">
                <Phone size={16} />
                <span className="text-sm">{member.phone}</span>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {member.regions.map((region, regionIndex) => (
                  <span
                    key={regionIndex}
                    className="bg-phamily-blue text-white px-2 py-1 rounded text-xs font-medium"
                  >
                    {region}
                  </span>
                ))}
              </div>
              <button className="mt-4 text-phamily-blue font-semibold text-sm hover:text-phamily-orange transition-colors duration-300">
                More info
              </button>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default TeamSection
