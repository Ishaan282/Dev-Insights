// github-rate-limit.ts
interface GitHubRateLimitResponse {
    resources: {
      core: {
        limit: number;
        remaining: number;
        reset: number; // Unix timestamp in seconds
      };
      search: {
        limit: number;
        remaining: number;
        reset: number;
      };
      // Add other resources if needed
    };
    rate: {
      limit: number;
      remaining: number;
      reset: number;
    };
  }
  
  const GITHUB_TOKEN: string | undefined = process.env.GITHUB_TOKEN;
  
  async function checkRateLimit(): Promise<void> {
    if (!GITHUB_TOKEN) {
      console.error('GITHUB_TOKEN is not defined in environment variables');
      return;
    }
  
    try {
      const response: Response = await fetch('https://api.github.com/rate_limit', {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'User-Agent': 'Bun-RateLimit-Checker'
        }
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data: GitHubRateLimitResponse = await response.json();
      
      console.log('GitHub Rate Limit Info:');
      console.log('Core Limit:', data.resources.core.limit);
      console.log('Core Remaining:', data.resources.core.remaining);
      console.log('Core Reset Time:', new Date(data.resources.core.reset * 1000).toLocaleString());
      
      console.log('\nSearch Limit:', data.resources.search.limit);
      console.log('Search Remaining:', data.resources.search.remaining);
      
      // The root rate object is also available (same as core)
      console.log('\nRate Limit (root):', data.rate.limit);
      console.log('Rate Remaining (root):', data.rate.remaining);
      
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error checking rate limit:', error.message);
      } else {
        console.error('Unknown error occurred:', error);
      }
    }
  }
  
  checkRateLimit();