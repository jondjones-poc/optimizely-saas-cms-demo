'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Calendar, ArrowRight } from 'lucide-react'

const CommunitySection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const articles = [
    {
      category: "Entrepreneurship",
      date: "10/02/2025",
      title: "Business: Fund or Shares?",
      description: "Getting started with acquiring your business involves several steps, including one: Should I buy a business fund or a company (via its shares or shares)?",
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=250&fit=crop"
    },
    {
      category: "Legal",
      date: "15/10/2024", 
      title: "Business and commercial lease",
      description: "The commercial lease constitutes one of the essential contracts for operating a business since it organizes the conditions of occupation of the premises and relations with the...",
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=250&fit=crop"
    },
    {
      category: "Entrepreneurship",
      date: "03/12/2024",
      title: "Entrepreneur, a major player in health",
      description: "To excel in this demanding profession and reach your full potential, it is essential to develop five key areas: your relationships, your finances, your health, your...",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop"
    },
    {
      category: "Finance",
      date: "15/11/2024",
      title: "Decoding the Value of a Business: The Indicators Guide",
      description: "Valuing a business today is much more than a simple reading of accounts. Beyond the figures, we must understand the capacity of the office to generate...",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop"
    }
  ]

  const categories = ["B2B", "Entrepreneurship", "Studies & training", "Professional practice", "Finance", "Legal", "Transactions"]

  return (
    <section ref={ref} className="py-20 bg-phamily-lightGray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-phamily-darkGray mb-6">
            A community of (future) professionals
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold text-phamily-blue mb-8">
            Let the
            <span className="block text-phamily-orange">care shine</span>
          </h3>
          <p className="text-lg text-phamily-darkGray/80 max-w-3xl mx-auto">
            SaaSCMS is sharing good information, because we should know much more much earlier to make the right choices.
          </p>
        </motion.div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {articles.map((article, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 btn-hover"
            >
              <div className="relative h-48">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-phamily-blue text-white px-3 py-1 rounded-full text-sm font-medium">
                    {article.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-phamily-darkGray/60 text-sm mb-3">
                  <Calendar size={16} />
                  <span>{article.date}</span>
                </div>
                <h4 className="text-xl font-bold text-phamily-darkGray mb-3 line-clamp-2">
                  {article.title}
                </h4>
                <p className="text-phamily-darkGray/80 text-sm leading-relaxed mb-4 line-clamp-3">
                  {article.description}
                </p>
                <button className="text-phamily-blue font-semibold text-sm hover:text-phamily-orange transition-colors duration-300 flex items-center gap-1">
                  Read the article
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mb-12"
        >
          <h4 className="text-2xl font-bold text-phamily-darkGray mb-8">
            Explore our themes
          </h4>
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category, index) => (
              <button
                key={index}
                className="px-6 py-3 bg-white text-phamily-darkGray rounded-full font-medium hover:bg-phamily-blue hover:text-white transition-all duration-300 btn-hover"
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-center"
        >
          <h4 className="text-2xl font-bold text-phamily-darkGray mb-4">
            Join the community
          </h4>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-full border border-phamily-darkGray/20 focus:outline-none focus:border-phamily-blue transition-colors duration-300"
            />
            <button className="bg-phamily-blue text-white px-6 py-3 rounded-full font-semibold hover:bg-phamily-lightBlue transition-colors duration-300">
              Subscribe
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default CommunitySection
