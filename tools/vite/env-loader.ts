import fs from 'fs';
import path from 'path';

interface PartnerConfig {
  partner: string;
  partnerId: number;
  partnerName: string;
}

export function loadPartnerEnv(root: string): PartnerConfig {
  const partner = process.env.PARTNER;
  const envDir = path.join(root, 'env', 'src');

  if (partner) {
    const partnerFile = path.join(envDir, `env.${partner}.json`);
    if (fs.existsSync(partnerFile)) {
      const config = JSON.parse(fs.readFileSync(partnerFile, 'utf-8')) as PartnerConfig;
      console.log(`\u{1F535} Active PARTNER: ${config.partner} (ID: ${config.partnerId})`);
      return config;
    }
  }

  const defaultPartner = partner || 'administration';
  const defaultFile = path.join(envDir, `env.${defaultPartner}.json`);

  if (fs.existsSync(defaultFile)) {
    const config = JSON.parse(fs.readFileSync(defaultFile, 'utf-8')) as PartnerConfig;
    console.log(`\u{1F535} Active PARTNER: ${config.partner} (ID: ${config.partnerId})`);
    return config;
  }

  const fallbackFile = path.join(envDir, 'env.administration.json');
  if (fs.existsSync(fallbackFile)) {
    const config = JSON.parse(fs.readFileSync(fallbackFile, 'utf-8')) as PartnerConfig;
    console.log(`\u{1F535} Active PARTNER: ${config.partner} (ID: ${config.partnerId}) [fallback]`);
    return config;
  }

  throw new Error(`Environment file not found for partner: ${partner || 'administration'}`);
}
