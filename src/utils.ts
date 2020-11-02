import BigInt from 'big-integer';
import bs58 from 'bs58';
import createHash from 'create-hash';

export const bnSerialize = (amount: number): Buffer => {
  let hex = BigInt(amount).toString(16);
  hex = hex.length % 2 ? `0${hex}` : hex;
  const len = Math.floor(hex.length / 2);
  const u8 = new Uint8Array(8);
  for (let i = 0; i < len; i += 1) u8[len - i - 1] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return Buffer.from(u8);
};

export const ledgerSerialize = (transaction: any): Buffer => {
  const txSerialized = Buffer.concat([
    bnSerialize(transaction.amount),
    bnSerialize(transaction.fee),
    bnSerialize(transaction.nonce),
    Buffer.from([transaction.payee.version]),
    Buffer.from([transaction.payee.keyType]),
    Buffer.from(transaction.payee.publicKey),
  ]);
  return Buffer.from(txSerialized);
};

// https://github.com/helium/helium-js/pull/96
export const sha256 = (buffer: Buffer | string): Buffer => createHash('sha256').update(buffer).digest();
export const bs58CheckEncode = (
  version: number,
  binary: Buffer | Uint8Array,
): string => {
  const vPayload = Buffer.concat([Buffer.from([version]), binary]);
  const checksum = sha256(Buffer.from(sha256(vPayload)));
  const checksumBytes = Buffer.alloc(4, checksum, 'hex');
  const result = Buffer.concat([vPayload, checksumBytes]);
  return bs58.encode(result);
};
