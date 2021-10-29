import type Transport from "@ledgerhq/hw-transport";
import { utils } from '@helium/crypto';
import { ledgerSerialize } from './utils';
const CLA = 0xe0;
const CLA_OFFSET = 0x00;
const INS_GET_PUBKEY = 0x02;
const INS_SIGN_PAYMENT_V1 = 0x08;

/**
 * A Helium Ledger API
 *
 * @example
 * import { HNT } from "helios-transport";
 * const hnt = new HNT(transport);
 */

export default class HNT {
  private transport: any;

  constructor(transport: Transport, scrambleKey: string = 'HNT') {
    this.transport = transport;
    transport.decorateAppAPIMethods(
      this, ['getPublicKey', 'signTransaction'],
      scrambleKey,
    );
  }

  /**
   * get Helium publickey.
   * @param bip32 account, specifically a bip44 address_index number
   * @option boolDisplay optionally enable or not the display
   * @return an object with publicKey, bin, and b58 address
   */

  getPublicKey(
    account?: number,
    boolDisplay?: boolean,
  ): Promise<{ b58: string, publicKey: Buffer, bin: Buffer }> {
    let buffer = Buffer.from([0]);
    return this.transport
      .send(CLA, INS_GET_PUBKEY, boolDisplay ? 0x01 : 0x00, account, buffer)
      .then((response: any) => {
        return {
          bin: response.slice(1, 34),
          publicKey: response.slice(2, 34),
          b58: utils.bs58CheckEncode(0, response.slice(1, 34)),
        };
      });
  }

  /**
   * sign a Helium transaction.
   * @param transaction protobuf to sign
   * @param bip32 account, specifically a bip44 address_index number, to sign
   * @return an object with the signature and the status
   */

  signTransaction(
    transaction: any,
    account?: number
  ): Promise<{ signature: Buffer }> {
    const data = ledgerSerialize(transaction);
    return this.transport
      .send(CLA, INS_SIGN_PAYMENT_V1, account, CLA_OFFSET, data)
      .then((response: any) => {
        const signature = response.slice(response.length - 66, response.length - 2);
        if(signature.length !== 64) throw 'User has declined.';
        return {
          signature: signature,
        };
      });
  }
}
