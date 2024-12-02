import type { Env } from '../../../worker-configuration';
import { scrypt } from './scrypt/index';

const DEFAULT_ALPHABET = 'abcdefghijklmnopqrstuvwxyz1234567890';

export const generateRandomString = (
  length: number,
  alphabet: string = DEFAULT_ALPHABET
) => {
  const randomUint32Values = new Uint32Array(length);
  crypto.getRandomValues(randomUint32Values);
  const u32Max = 0xffffffff;
  let result = '';
  for (let i = 0; i < randomUint32Values.length; i++) {
    const rand = randomUint32Values[i] / (u32Max + 1);
    result += alphabet[Math.floor(alphabet.length * rand)];
  }
  return result;
};

export const generateScryptHash = async (s: string): Promise<string> => {
  const salt = generateRandomString(16);
  const key = await hashWithScrypt(s.normalize('NFKC'), salt);
  return `s2:${salt}:${key}`;
};

const hashWithScrypt = async (
  s: string,
  salt: string,
  blockSize = 16
): Promise<string> => {
  const keyUint8Array = await scrypt(
    new TextEncoder().encode(s),
    new TextEncoder().encode(salt),
    {
      N: 16384,
      r: blockSize,
      p: 1,
      dkLen: 64
    }
  );
  return convertUint8ArrayToHex(keyUint8Array);
};

export const validateScryptHash = async (
  s: string,
  hash: string
): Promise<boolean> => {
  // detect bcrypt hash
  // lucia used bcrypt in one of the beta versions
  // TODO: remove in v3
  if (hash.startsWith('$2a')) {
    throw new Error('AUTH_OUTDATED_PASSWORD');
  }
  const arr = hash.split(':');
  if (arr.length === 2) {
    const [salt, key] = arr;
    const targetKey = await hashWithScrypt(s.normalize('NFKC'), salt, 8);
    const result = constantTimeEqual(targetKey, key);
    return result;
  }
  if (arr.length !== 3) return false;
  const [version, salt, key] = arr;
  if (version === 's2') {
    const targetKey = await hashWithScrypt(s.normalize('NFKC'), salt);
    const result = constantTimeEqual(targetKey, key);
    return result;
  }
  return false;
};

const constantTimeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  const aUint8Array = new TextEncoder().encode(a);
  const bUint8Array = new TextEncoder().encode(b);

  let c = 0;
  for (let i = 0; i < a.length; i++) {
    c |= aUint8Array[i] ^ bUint8Array[i]; // ^: XOR operator
  }
  return c === 0;
};

export const convertUint8ArrayToHex = (arr: Uint8Array): string => {
  return [...arr].map((x) => x.toString(16).padStart(2, '0')).join('');
};

interface HashArguments {
  password: string;
  kdf?: Env['AUTH_KDF'];
  salt: string;
  iterations?: number;
  hash?: string;
}

export const hashPassword = async ({
  password,
  kdf = 'pbkdf2',
  salt,
  iterations = 100000,
  hash = 'SHA-512'
}: HashArguments): Promise<{
  kdf: 'pbkdf2' | 'scrypt';
  hash: string;
  salt: string;
  iterations: number;
  hashedPassword: string;
}> => {
  password = password.normalize('NFKC');
  if (kdf !== 'pbkdf2' && kdf !== 'scrypt') {
    kdf = 'pbkdf2';
  }
  hash = hash.toUpperCase();
  if (hash !== 'SHA-512' && hash !== 'SHA-384' && hash !== 'SHA-256') {
    hash = 'SHA-512';
  }
  if (kdf === 'pbkdf2') {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    const baseKey = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    let dkLen = 64;
    switch (hash) {
      case 'SHA-384':
        dkLen = 48;
        break;
      case 'SHA-256':
        dkLen = 32;
        break;
    }
    const hashedPassword = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: encoder.encode(salt),
        iterations,
        hash
      },
      baseKey,
      dkLen * 8
    );

    return {
      kdf,
      hash,
      salt,
      iterations,
      hashedPassword: String.fromCharCode.apply(
        null,
        new Uint8Array(hashedPassword) as unknown as number[]
      )
    };
  } else {
    return {
      kdf,
      hash,
      salt,
      iterations,
      hashedPassword: await generateScryptHash(password)
    };
  }
};

export const validateHash = async (
  userPassword: string,
  dbHash: string
): Promise<boolean> => {
  const [hasher, hashedPassword, salt, hash, iterations] = dbHash.split(':$:');

  let kdf: Env['AUTH_KDF'] = 'pbkdf2';
  if (hasher === 'lca') {
    kdf = 'scrypt';
  }
  if (kdf === 'pbkdf2') {
    const verifyHash = await hashPassword({
      password: userPassword,
      kdf,
      salt,
      iterations: getIterations(iterations),
      hash
    });
    return constantTimeEqual(verifyHash.hashedPassword, hashedPassword);
  } else {
    return await validateScryptHash(userPassword, dbHash.substring(4));
  }
};

export const generateRandomInteger = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min) + min);
};

function getIterations(iterationsString?: string) {
  let iterations = 100000;
  if (iterationsString) {
    try {
      iterations = +iterationsString;
    } catch (e) {
      console.error('failed to parse AUTH_ITERATIONS', e);
    }
  }
  return Math.min(iterations, 100000);
}
