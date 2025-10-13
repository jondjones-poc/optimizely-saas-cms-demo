# Deployment Instructions

## Environment Variables Required

For this application to work properly, you need to set the following environment variables in your deployment platform:

### Required Environment Variables:
- `NEXT_PUBLIC_SDK_KEY` - Your Optimizely Graph SDK key
- `OPTIMIZELY_GRAPH_SINGLE_KEY` - Alternative name for the SDK key (fallback)

### Setting Environment Variables:

#### Netlify:
1. Go to Site settings > Environment variables
2. Add `NEXT_PUBLIC_SDK_KEY` with your Optimizely SDK key value
3. Add `OPTIMIZELY_GRAPH_SINGLE_KEY` with the same value (as fallback)

#### Vercel:
1. Go to Project settings > Environment Variables
2. Add `NEXT_PUBLIC_SDK_KEY` with your Optimizely SDK key value
3. Add `OPTIMIZELY_GRAPH_SINGLE_KEY` with the same value (as fallback)

#### Other Platforms:
Set both environment variables with your Optimizely Graph SDK key.

## Build Process

The application uses Next.js and should build without issues once the environment variables are set correctly.

## GraphQL Code Generation

If you encounter GraphQL code generation errors during build, ensure that:
1. Environment variables are properly set
2. The Optimizely Graph endpoint is accessible
3. The SDK key has the correct permissions

## Troubleshooting

If you see errors like "undefined/content/v2?auth=undefined", it means the environment variables are not set in your deployment environment.
