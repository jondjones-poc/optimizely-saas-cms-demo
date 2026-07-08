import CustomHeader from '@/components/CustomHeader'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import CustomFooter from '@/components/CustomFooter'

export const metadata = {
  title: 'Demo Site Overview',
  description: 'Learn how this Optimizely SaaS CMS demo site works',
}

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <CustomHeader />
      <Navigation />
      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 pt-24">{children}</div>
      <Footer />
      <CustomFooter optimizelyData={null} isLoading={false} error={null} />
    </main>
  )
}
