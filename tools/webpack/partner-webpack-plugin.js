const fs = require('fs');
const path = require('path');

class PartnerWebpackPlugin {
  constructor(partner) {
    this.partner = partner;
    this.overrideFiles = new Set();
  }

  apply(compiler) {
    // Hook into the module factory to intercept and replace modules
    compiler.hooks.normalModuleFactory.tap('PartnerWebpackPlugin', (nmf) => {
      nmf.hooks.afterResolve.tapAsync('PartnerWebpackPlugin', (resolveData, callback) => {
        if (!resolveData) return callback();

        const resourcePath = resolveData.createData?.resource || resolveData.resource;
        const issuer = resolveData.contextInfo?.issuer;

        if (!resourcePath) return callback();

        // Skip node_modules
        if (resourcePath.includes('node_modules')) return callback();

        // Skip if the import is coming from an override file (prevent circular replacement)
        if (issuer && issuer.includes(`.${this.partner}.`)) {
          return callback();
        }

        // Only process TS/JS files
        if (!/\.(ts|tsx|js|jsx)$/.test(resourcePath)) return callback();

        const ext = path.extname(resourcePath);
        const base = path.basename(resourcePath, ext);
        const dir = path.dirname(resourcePath);

        // Check if this is a base file that has a partner-specific override
        // Only override if the file doesn't already have the partner suffix
        if (!base.endsWith(`.${this.partner}`)) {
          const overrideFile = path.join(dir, `${base}.${this.partner}${ext}`);

          if (fs.existsSync(overrideFile)) {
            console.log(
              `🔁 Override: ${path.basename(resourcePath)} → ${path.basename(overrideFile)}`,
            );

            // Replace the resource with the override file
            if (resolveData.createData) {
              resolveData.createData.resource = overrideFile;
              resolveData.createData.userRequest = overrideFile;
            }
            resolveData.resource = overrideFile;

            this.overrideFiles.add(overrideFile);
          }
        }

        callback();
      });
    });

    // Add watch for override files to trigger hot reload
    compiler.hooks.afterCompile.tap('PartnerWebpackPlugin', (compilation) => {
      this.overrideFiles.forEach((file) => {
        compilation.fileDependencies.add(file);
      });
    });
  }
}

module.exports = { PartnerWebpackPlugin };
