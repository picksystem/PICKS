import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { fileURLToPath } from 'url';
import path from 'path';
import { partnerVitePlugin } from '../../../tools/vite/partner-vite-plugin';
import { loadPartnerEnv } from '../../../tools/vite/env-loader';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');

const PARTNER = process.env.PARTNER || 'administration';
process.env.PARTNER = PARTNER;

const partnerConfig = loadPartnerEnv(ROOT);

console.log('\u{1F535} Building Administration App');
console.log('\u{1F4E6} PARTNER:', PARTNER);

export default defineConfig(({ mode }) => ({
  root: __dirname,

  plugins: [
    react(),
    tsconfigPaths({ root: ROOT, ignoreConfigErrors: true }),
    partnerVitePlugin(PARTNER),
  ],

  define: {
    // --- Partner / app globals (match webpack DefinePlugin) ---
    'process.env.NODE_ENV': JSON.stringify(mode),
    'process.env.PARTNER': JSON.stringify(partnerConfig.partner || PARTNER),
    'process.env.PARTNER_ID': JSON.stringify(partnerConfig.partnerId),
    'process.env.PARTNER_NAME': JSON.stringify(partnerConfig.partnerName),
    'process.env.API_URL': JSON.stringify(process.env.API_URL || 'http://localhost:3001'),
    '__PARTNER_CONFIG__': JSON.stringify(partnerConfig),
    'APP_NAME': JSON.stringify('administration'),
    'PARTNER': JSON.stringify(PARTNER),

    // --- REACT_APP_* vars (not injected by webpack either; all use their defaults) ---
    'process.env.REACT_APP_API_URL': 'undefined',
    'process.env.REACT_APP_API_TIMEOUT': 'undefined',
    'process.env.REACT_APP_AUTH_TOKEN_KEY': 'undefined',
    'process.env.REACT_APP_REFRESH_TOKEN_KEY': 'undefined',
    'process.env.REACT_APP_NAME': 'undefined',
    'process.env.REACT_APP_VERSION': 'undefined',
    'process.env.REACT_APP_ENVIRONMENT': 'undefined',
    'process.env.REACT_APP_ENABLE_ANALYTICS': 'undefined',
    'process.env.REACT_APP_ENABLE_DEBUG_MODE': 'undefined',
    'process.env.REACT_APP_DEFAULT_PAGE_SIZE': 'undefined',
    'process.env.REACT_APP_MAX_PAGE_SIZE': 'undefined',
    'process.env.REACT_APP_SESSION_TIMEOUT': 'undefined',
    'process.env.REACT_APP_IDLE_TIMEOUT': 'undefined',
    'process.env.REACT_APP_MAX_FILE_SIZE': 'undefined',
    'process.env.REACT_APP_ALLOWED_FILE_TYPES': 'undefined',
    'process.env.REACT_APP_PARTNER_NAME': 'undefined',
    'process.env.REACT_APP_PARTNER_ID': 'undefined',
  },

  server: {
    port: 1600,
    open: false,
  },

  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    sourcemap: true,
  },
}));
