/** @type {import('next').NextConfig} */

// Determine if the app is being built for GitHub Pages deployment
const isGithubActions = process.env.GITHUB_ACTIONS === 'true';

let assetPrefix = undefined;
let basePath = undefined;

// IMPORTANT: Replace 'RNGtoTRADE' with the actual name of your GitHub repository
const repoName = 'RNGtoTRADE';

if (isGithubActions) {
  // Define the base path for GitHub Pages, should match the repository name
  basePath = `/${repoName}`;
  // Define the asset prefix for loading static files (CSS, JS, images)
  assetPrefix = `/${repoName}/`;
}

const nextConfig = {
  // Enable static export
  output: 'export',

  // Set basePath and assetPrefix only for GitHub Actions builds
  basePath: basePath,
  assetPrefix: assetPrefix,

  // Optional: Disable Next.js Image Optimization API if you don't need it
  // or if you are only using standard <img> tags.
  // The default Image component loader is not compatible with static export without configuration.
  // Using `unoptimized: true` is the simplest way for static exports.
  images: {
    unoptimized: true,
  },

  // Standard React strict mode
  reactStrictMode: true,
};

module.exports = nextConfig;