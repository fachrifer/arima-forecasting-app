import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // Expose the modul-toggle flag to the client bundle.
  // Value is baked in at build time via the NEXT_PUBLIC_INCLUDE_MODUL env var.
  env: {
    NEXT_PUBLIC_INCLUDE_MODUL: process.env.NEXT_PUBLIC_INCLUDE_MODUL ?? "false",
  },
};

export default nextConfig;
