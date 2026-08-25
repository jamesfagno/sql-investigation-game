import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    resolveAlias: {
      alasql: "./node_modules/alasql/dist/alasql.min.js",
    },
  },
};

export default nextConfig;
