import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import SEOButton from '../SEOButton'
import { transformLandingPageData } from '@/utils/seoDataTransformers'

// Mock the landing page API response structure
const mockLandingPageData = {
  success: true,
  data: {
    data: {
      LandingPage: {
        items: [
          {
            _metadata: {
              key: 'landing-page-key',
              version: 1,
              types: ['LandingPage'],
              displayName: 'Landing Page',
              url: {
                default: '/landing-page'
              },
              published: '2024-01-01T00:00:00Z',
              status: 'Published'
            },
            TopContentArea: [
              {
                _metadata: {
                  displayName: 'Hero Component',
                  types: ['Hero']
                },
                Heading: 'Welcome to Our Landing Page',
                SubHeading: 'Subheading text',
                Body: {
                  html: '<p>Body content</p>'
                }
              }
            ],
            MainContentArea: [
              {
                _metadata: {
                  displayName: 'Text Component',
                  types: ['ContentBlock']
                },
                Content: 'Main content text'
              },
              {
                _metadata: {
                  displayName: 'Image Component',
                  types: ['Image']
                },
                Image: {
                  url: {
                    default: '/path/to/image.jpg'
                  }
                }
              }
            ]
          }
        ]
      }
    }
  }
}

describe('LandingPage SEOButton', () => {
  it('should extract SEO data correctly from landing page data', () => {
    const transformedData = transformLandingPageData(mockLandingPageData.data.data.LandingPage.items[0])
    render(<SEOButton {...transformedData} />)
    
    // Click the button to open the modal
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    // Check if SEO data is displayed
    expect(screen.getByText('SEO Settings')).toBeInTheDocument()
    expect(screen.getByText('Meta Title:')).toBeInTheDocument()
    expect(screen.getByText('Landing Page')).toBeInTheDocument()
  })

  it('should extract page metadata correctly', () => {
    const transformedData = transformLandingPageData(mockLandingPageData.data.data.LandingPage.items[0])
    render(<SEOButton {...transformedData} />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    // Switch to Formatted tab
    const formattedTab = screen.getByText('Formatted')
    fireEvent.click(formattedTab)
    
    // Check if page metadata is displayed
    expect(screen.getByText('Page Type:')).toBeInTheDocument()
    expect(screen.getByText('LandingPage')).toBeInTheDocument()
    expect(screen.getByText('Display Name:')).toBeInTheDocument()
    expect(screen.getByText('Landing Page')).toBeInTheDocument()
  })

  it('should extract CMS blocks correctly from TopContentArea and MainContentArea', () => {
    const transformedData = transformLandingPageData(mockLandingPageData.data.data.LandingPage.items[0])
    render(<SEOButton {...transformedData} />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    // Switch to CMS Blocks tab
    const blocksTab = screen.getByText(/CMS Blocks/)
    fireEvent.click(blocksTab)
    
    // Check if blocks are displayed
    expect(screen.getByText('Hero Component')).toBeInTheDocument()
    expect(screen.getByText('Text Component')).toBeInTheDocument()
    expect(screen.getByText('Image Component')).toBeInTheDocument()
    expect(screen.getByText('Hero (Hero Component)')).toBeInTheDocument()
    expect(screen.getByText('Text (Text Component)')).toBeInTheDocument()
    expect(screen.getByText('Image (Image Component)')).toBeInTheDocument()
  })

  it('should handle empty data gracefully', () => {
    const transformedData = transformLandingPageData(null)
    render(<SEOButton {...transformedData} />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    // Should show "No SEO data available" message
    expect(screen.getByText('No SEO data available')).toBeInTheDocument()
  })

  it('should handle malformed data gracefully', () => {
    const malformedData = {
      success: true,
      data: {
        data: {
          LandingPage: {
            items: []
          }
        }
      }
    }
    
    const transformedData = transformLandingPageData(malformedData.data.data.LandingPage.items[0])
    render(<SEOButton {...transformedData} />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    // Should show "No SEO data available" message
    expect(screen.getByText('No SEO data available')).toBeInTheDocument()
  })
})
