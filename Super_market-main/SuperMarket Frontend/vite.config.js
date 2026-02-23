import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  // Server configuration for development
  server: {
    port: 3000,
    host: true, // Listen on all addresses
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
    // Enable HMR for faster development
    hmr: {
      overlay: true,
    },
  },
  
  // Preview server for production preview
  preview: {
    port: 3000,
    host: true,
  },
  
  // Build optimizations for ultra-fast performance
  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    
    // Output directory
    outDir: 'dist',
    assetsDir: 'assets',
    
    // Chunk size warnings
    chunkSizeWarningLimit: 600,
    
    // Rollup options for optimal chunking
    rollupOptions: {
      output: {
        // Manual chunks for optimal caching
        manualChunks: {
          // Core React vendor (rarely changes)
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI libraries
          'vendor-ui': ['lucide-react', 'react-hot-toast'],
          // Network layer
          'vendor-network': ['axios'],
          // PDF generation (heavy, lazy loaded)
          'vendor-pdf': ['@react-pdf/renderer'],
          // Charts (only for SuperAdmin)
          'vendor-charts': ['recharts'],
        },
        
        // Asset file naming for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId 
            ? chunkInfo.facadeModuleId.split('/').pop() 
            : 'chunk';
          return `assets/js/${chunkInfo.name || facadeModuleId}-[hash].js`;
        },
        
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash].${ext}`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash].${ext}`;
          }
          if (/\.css$/i.test(assetInfo.name)) {
            return `assets/css/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },
      },
    },
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Enable module preload
    modulePreload: {
      polyfill: true,
    },
    
    // Report compressed sizes
    reportCompressedSize: true,
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'lucide-react',
      'react-hot-toast',
      // Include base64-js to fix ESM compatibility with @react-pdf/renderer
      'base64-js',
    ],
  },
  
  // Define environment variables
  define: {
    __APP_VERSION__: JSON.stringify('1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@utils': '/src/utils',
      '@contexts': '/src/contexts',
      '@assets': '/src/assets',
      // Fix for base64-js ESM compatibility with @react-pdf/renderer/linebreak
      'base64-js': 'base64-js',
    },
  },
  
  // SSR configuration
  ssr: {
    noExternal: ['@react-pdf/renderer'],
  },
  
  // Performance hints
  performance: {
    hints: 'warning',
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
});
