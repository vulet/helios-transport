import type Transport from '@ledgerhq/hw-transport';
import { PaymentV1, TokenBurnV1 } from '@helium/transactions';
import { utils } from '@helium/crypto';
import { serializePaymentV1, serializeBurnV1 } from './utils';
const CLA = 0xe0;
const CLA_OFFSET = 0x00;
const INS_GET_PUBKEY = 0x02;
const INS_SIGN_PAYMENT_V1 = 0x08;
const INS_SIGN_BURN_V1 = 0x0C;
const EMPTY_MEMO = 'AAAAAAAAAAA=';

/**
 * A Helium Ledger API
 *
 * @example
 * import { HNT } from "helios-transport";
 * const hnt = new HNT(transport);
 */

export default class HNT {
  private transport: Transport;
  constructor(transport: Transport, scrambleKey: string = 'HNT') {
    this.transport = transport;
    transport.decorateAppAPIMethods(
      this, ['getPublicKey', 'signPaymentV1', 'signBurnV1'],
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
    address_index?: number,
    boolDisplay?: boolean,
  ): Promise<{ b58: string, publicKey: Buffer, bin: Buffer }> {
    const buffer = Buffer.from([0]);
    return this.transport
      .send(
        CLA,
        INS_GET_PUBKEY,
        boolDisplay ? 0x01 : 0x00,
        address_index || 0x00,
        buffer,
      )
      .then((response: Buffer) => ({
        bin: response.slice(1, 34),
        publicKey: response.slice(2, 34),
        b58: utils.bs58CheckEncode(0, response.slice(1, 34)),
      }));
  }

  /**
   * sign a Helium PaymentV1 transaction.
   * @param transaction protobuf to sign
   * @param bip32 account, specifically a bip44 address_index number, to sign
   * @return an object with signature
   */

  signPaymentV1(
    transaction: PaymentV1,
    address_index?: number,
  ): Promise<{ signature: Buffer }> {
    const data = serializePaymentV1(transaction);
    return this.transport
      .send(
        CLA,
        INS_SIGN_PAYMENT_V1,
        address_index || 0x00,
        CLA_OFFSET,
        data,
      )
      .then((response: Buffer) => {
        const signature = response.slice(response.length - 66, response.length - 2);
        if (signature.length !== 64) throw 'User has declined.';
        return {
          signature,
        };
      });
  }

  /**
   * sign a Helium BurnV1 transaction.
   * @param transaction protobuf to sign
   * @param bip32 account, specifically a bip44 address_index number, to sign
   * @return an object with signature
   */

  signBurnV1(
    transaction: TokenBurnV1,
    address_index?: number,
  ): Promise<{ signature: Buffer }> {
    const data = serializeBurnV1(transaction);
    return this.transport
      .send(
        CLA,
        INS_SIGN_BURN_V1,
        address_index || 0x00,
        CLA_OFFSET,
        data,
      )
      .then((response: Buffer) => {
        const signature = response.slice(
          transaction.memo === EMPTY_MEMO
            ? response.length - 70 : response.length - 80,
          transaction.memo === EMPTY_MEMO
            ? response.length - 6 : response.length - 16,
        );
        if (signature.length !== 64) throw 'User has declined.';
        return {
          signature,
        };
      });
  }
}
