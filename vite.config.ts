import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Upload source maps to Sentry in production builds
    mode === "production" && process.env.VITE_SENTRY_DSN && sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: true, // Enable source maps for Sentry
    rollupOptions: {
      output: {
        manualChunks: {
          // Split React and routing into separate chunk
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Split UI libraries
          'ui-vendor': ['framer-motion', 'lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          // Split data fetching
          'query-vendor': ['@tanstack/react-query'],
          // Split form libraries
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
        },
      },
    },
  },
}));
