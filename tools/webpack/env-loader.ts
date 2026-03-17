import * as fs from 'fs';
import * as path from 'path';

export interface PartnerConfig {
  partner: string;
  partnerId: number;
  partnerName: string;
}

/**
 * Load partner environment configuration
 *
 * Priority:
 * 1. If PARTNER env is set (e.g., "generale-partner"), use env.{PARTNER}.json
 * 2. Otherwise, fallback to the app type (admin/user) as default
 *
 * @param root - Project root directory
 * @returns Partner configuration object
 */
export function loadPartnerEnv(root: string): PartnerConfig {
  const partner = process.env.PARTNER;
  const envDir = path.join(root, 'env', 'src');

  // If a specific partner is set, try to load it
  if (partner) {
    const partnerFile = path.join(envDir, `env.${partner}.json`);
    if (fs.existsSync(partnerFile)) {
      const config: PartnerConfig = JSON.parse(fs.readFileSync(partnerFile, 'utf-8'));
      console.log(`🔵 Active PARTNER: ${config.partner} (ID: ${config.partnerId})`);
      return config;
    }
  }

  // Fallback: Use administration as default
  const defaultPartner = partner || 'administration';
  const defaultFile = path.join(envDir, `env.${defaultPartner}.json`);

  if (fs.existsSync(defaultFile)) {
    const config: PartnerConfig = JSON.parse(fs.readFileSync(defaultFile, 'utf-8'));
    console.log(`🔵 Active PARTNER: ${config.partner} (ID: ${config.partnerId})`);
    return config;
  }

  // Final fallback: try administration
  const fallbackFile = path.join(envDir, 'env.administration.json');
  if (fs.existsSync(fallbackFile)) {
    const config: PartnerConfig = JSON.parse(fs.readFileSync(fallbackFile, 'utf-8'));
    console.log(`🔵 Active PARTNER: ${config.partner} (ID: ${config.partnerId}) [fallback]`);
    return config;
  }

  throw new Error(`❌ Environment file not found for partner: ${partner || 'administration'}`);
}
