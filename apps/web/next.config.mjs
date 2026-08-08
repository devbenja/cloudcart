/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // En producción el frontend podría servirse bajo un subpath o domain distinto
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
};

export default nextConfig;
