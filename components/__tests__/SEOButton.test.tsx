import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import SEOButton from '../SEOButton'

// Mock the homepage API response structure
const mockHomepageData = {
  success: true,
  data: {
    BlankExperience: {
      items: [
        {
          _metadata: {
            key: 'test-key',
            version: 1,
            types: ['BlankExperience'],
            displayName: 'Homepage',
            url: {
              default: '/'
            },
            published: '2024-01-01T00:00:00Z',
            status: 'Published'
          },
          composition: {
            grids: [
              {
                displayName: 'Main Grid',
                rows: [
                  {
                    displayName: 'Hero Row',
                    columns: [
                      {
                        displayName: 'Hero Column',
                        elements: [
                          {
                            displayName: 'Hero Component',
                            component: {
                              _metadata: {
                                key: 'hero-key',
                                types: ['Hero'],
                                displayName: 'Hero Block'
                              }
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
      ]
    }
  }
}

describe('SEOButton', () => {
  const mockSeoData = {
    seoData: {
      MetaTitle: 'Homepage',
      MetaDescription: 'Transform your business with our comprehensive SaaS platform',
      GraphType: 'website',
      DisplayInMenu: 'true',
      Indexing: 'index'
    },
    pageMetadata: {
      pageType: 'BlankExperience',
      displayName: 'Homepage',
      status: 'Published',
      url: '/'
    },
    cmsBlocks: ['Main Grid', 'Hero Row', 'Hero Column', 'Hero (Hero Component)']
  }

  it('should display SEO data correctly', () => {
    render(
      <SEOButton 
        seoData={mockSeoData.seoData}
        pageMetadata={mockSeoData.pageMetadata}
        cmsBlocks={mockSeoData.cmsBlocks}
      />
    )
    
    // Click the button to open the modal
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    // Check if SEO data is displayed
    expect(screen.getByText('SEO Settings')).toBeInTheDocument()
    expect(screen.getByText('Meta Title:')).toBeInTheDocument()
    expect(screen.getByText('Homepage')).toBeInTheDocument()
  })

  it('should display page metadata correctly', () => {
    render(
      <SEOButton 
        seoData={mockSeoData.seoData}
        pageMetadata={mockSeoData.pageMetadata}
        cmsBlocks={mockSeoData.cmsBlocks}
      />
    )
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    // Switch to Formatted tab
    const formattedTab = screen.getByText('Formatted')
    fireEvent.click(formattedTab)
    
    // Check if page metadata is displayed
    expect(screen.getByText('Page Type:')).toBeInTheDocument()
    expect(screen.getByText('BlankExperience')).toBeInTheDocument()
    expect(screen.getByText('Display Name:')).toBeInTheDocument()
    expect(screen.getByText('Homepage')).toBeInTheDocument()
  })

  it('should display CMS blocks correctly', () => {
    render(
      <SEOButton 
        seoData={mockSeoData.seoData}
        pageMetadata={mockSeoData.pageMetadata}
        cmsBlocks={mockSeoData.cmsBlocks}
      />
    )
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    // Switch to CMS Blocks tab
    const blocksTab = screen.getByText(/CMS Blocks/)
    fireEvent.click(blocksTab)
    
    // Check if blocks are displayed
    expect(screen.getByText('Main Grid')).toBeInTheDocument()
    expect(screen.getByText('Hero Row')).toBeInTheDocument()
    expect(screen.getByText('Hero Column')).toBeInTheDocument()
    expect(screen.getByText('Hero (Hero Component)')).toBeInTheDocument()
  })

  it('should handle empty data gracefully', () => {
    render(<SEOButton />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    // Should show "No SEO data available" message
    expect(screen.getByText('No SEO data available')).toBeInTheDocument()
  })

  it('should handle loading state', () => {
    render(<SEOButton loading={true} />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    // Should show loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})
