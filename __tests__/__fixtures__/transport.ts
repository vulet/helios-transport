import { Address } from '@helium/crypto';
import {
  createTransportReplayer,
  RecordStore,
} from '@ledgerhq/hw-transport-mocker';
import HNT from '../../src/helios-transport';

export const jill = Address.fromB58('14bd3ebMAocy9BAEoXwrBcpBTkk2AZvgj4ng5MzNKyax8iK814v');
export const txToBase64 = 'QowBCiEBWUrgi9jvHMaDE92YlBsJ+SEPmkf+lBBtTYgYJfLWUrESIQHZs1mBeQIsqZIr5WiM1LDMUFEv7vor/IMaNF7akRs8mhgBKAEyQD6m2hcgW5sNJ5Q2tQjNCStoa/W5Id30+/OIeeSVBAIgdRDOvzIBn12ZQQK/5lcLsvXQuTGQKtbYOcW0VSpJLLk=';
export const ledgerHex = '0080c6a47e8d0300000000000000000001000000000000000001d9b3598179022ca9922be5688cd4b0cc50512feefa2bfc831a345eda911b3c9a';
export const quadrillionBones = 1000000000000000;

export const findJack = async () => {
  const Transport = createTransportReplayer(
    RecordStore.fromString(`
    => e00200000100
    <= 0001594ae08bd8ef1cc68313dd98941b09f9210f9a47fe94106d4d881825f2d652b19000
    `),
  );
  const transport = await Transport.open();
  const hnt = new HNT(transport);
  const result = await hnt.getPublicKey();
  const jack = new Address(0, 1, result.publicKey);
  return jack;
};
