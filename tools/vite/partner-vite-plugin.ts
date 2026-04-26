import fs from 'fs';
import path from 'path';
import type { Plugin } from 'vite';

const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'] as const;

/**
 * Vite equivalent of PartnerWebpackPlugin.
 *
 * For every relative import, checks whether a partner-specific override exists
 * next to the base file using the naming convention:
 *   {basename}.{partner}{ext}
 *
 * Example: resolving './Button.styles' when partner='generale-partner'
 *   checks for Button.styles.generale-partner.ts → returns it if found.
 *
 * Prevents circular replacements by skipping imports that come from an
 * already-overridden file (one whose path contains .{partner}.).
 */
export function partnerVitePlugin(partner: string): Plugin {
  return {
    name: 'partner-override',
    enforce: 'pre',

    resolveId(source: string, importer: string | undefined): string | null {
      // Only intercept relative imports
      if (!importer || !source.startsWith('.')) return null;
      if (importer.includes('node_modules')) return null;
      // Prevent circular replacement
      if (importer.includes(`.${partner}.`)) return null;

      const resolvedBase = path.resolve(path.dirname(importer), source);
      const existingExt = path.extname(resolvedBase);

      if (existingExt && (EXTENSIONS as readonly string[]).includes(existingExt)) {
        // Source already carries an extension (e.g. './Button.styles.ts')
        const base = resolvedBase.slice(0, -existingExt.length);
        const overridePath = `${base}.${partner}${existingExt}`;
        if (fs.existsSync(overridePath)) {
          console.log(
            `\u{1F501} Override: ${path.basename(resolvedBase)} → ${path.basename(overridePath)}`,
          );
          return overridePath;
        }
        return null;
      }

      // Source has no extension (e.g. './Button.styles') – try each extension
      for (const ext of EXTENSIONS) {
        const basePath = `${resolvedBase}${ext}`;
        if (fs.existsSync(basePath)) {
          const overridePath = `${resolvedBase}.${partner}${ext}`;
          if (fs.existsSync(overridePath)) {
            console.log(
              `\u{1F501} Override: ${path.basename(basePath)} → ${path.basename(overridePath)}`,
            );
            return overridePath;
          }
          // Found the base file but no override — stop searching
          break;
        }
      }

      return null;
    },
  };
}
