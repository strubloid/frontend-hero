import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production standalone output for Docker deployment
  output: "standalone",

  // TypeScript strict mode
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },

  // Enable SCSS
  sassOptions: {
    silenceDeprecations: ["legacy-js-api"],
  },
};

export default nextConfig;
