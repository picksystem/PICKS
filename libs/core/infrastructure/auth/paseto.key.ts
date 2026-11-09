import crypto from 'crypto';
import { V2 } from 'paseto';

/**
 * Deterministic Ed25519 keypair derived from a secret, for PASETO v2 (public)
 * signed tokens.
 *
 * PASETO is the recommended replacement for *short-lived* signed tokens. It is
 * NOT used for sessions — those are server-side cookie sessions.
 *
 * The key is derived deterministically from the secret so every server process
 * (and every replica, if deployed as multiple containers) can verify the same
 * tokens without a shared key store: seed = SHA-512(secret)[:32], wrapped in a
 * PKCS#8 DER that Node accepts for ed25519.
 */

let pkcs8Template: Buffer | null = null;

function getTemplate(): Buffer {
  if (!pkcs8Template) {
    const { privateKey } = crypto.generateKeyPairSync('ed25519');
    pkcs8Template = privateKey.export({ type: 'pkcs8', format: 'der' }) as Buffer;
  }
  return pkcs8Template;
}

export function deriveEd25519FromSecret(secret: string): crypto.KeyObject {
  // ed25519 PKCS#8 DER layout: [30 2e 02 01 01 04 22 04 20 <32-byte seed>]
  // The seed is always the final 32 bytes of the DER.
  const der = Buffer.from(getTemplate());
  const seed = crypto.createHash('sha512').update(secret).digest().subarray(0, 32);
  seed.copy(der, der.length - 32);
  return crypto.createPrivateKey({ key: der, format: 'der', type: 'pkcs8' });
}

export interface PasetoSigner {
  sign(payload: object, options?: { expiresIn?: string }): Promise<string>;
  verify(token: string, options?: { clockTolerance?: string }): Promise<Record<string, unknown>>;
}

/**
 * Get the app-wide PASETO signer. Uses PASETO_SECRET if set, otherwise falls
 * back to deriving from SESSION_SECRET so no extra secret has to be managed.
 */
export function getPasetoSigner(): PasetoSigner {
  const secret =
    process.env.PASETO_SECRET || process.env.SESSION_SECRET || 'serivceops-session-secret';
  const key = deriveEd25519FromSecret(secret);
  return {
    sign: async (payload, options) => {
      const token = await V2.sign(payload, key, options);
      return token;
    },
    verify: async (token, options) => {
      const payload = await V2.verify(token, key, options);
      return payload as Record<string, unknown>;
    },
  };
}
