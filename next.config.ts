import { withWhopAppConfig } from "@whop/react/next.config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Optimize for Whop iframe environment
	experimental: {
		optimizePackageImports: ['@whop/api', '@whop/react'],
	},
	
	// Enable iframe embedding
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{
						key: 'X-Frame-Options',
						value: 'ALLOWALL',
					},
					{
						key: 'Content-Security-Policy',
						value: "frame-ancestors *; frame-src *;",
					},
				],
			},
		];
	},
	
	// Image optimization
	images: {
		remotePatterns: [{ hostname: "**" }],
		domains: ['whop.com', 'cdn.whop.com'],
		formats: ['image/webp', 'image/avif'],
	},
	
	// Build optimization
	eslint: {
		ignoreDuringBuilds: true,
	},
	
	// Optimize for production
	compress: true,
	poweredByHeader: false,
	
	// Webpack optimization for Whop environment
	webpack: (config, { isServer }) => {
		// Optimize bundle for iframe
		if (!isServer) {
			config.resolve.fallback = {
				...config.resolve.fallback,
				fs: false,
				net: false,
				tls: false,
			};
		}
		
		return config;
	},
	
	// Redirects for better UX in iframe
	async redirects() {
		return [
			{
				source: '/login',
				destination: '/dashboard',
				permanent: false,
			},
			{
				source: '/signup',
				destination: '/dashboard',
				permanent: false,
			},
		];
	},
};

export default withWhopAppConfig(nextConfig);
