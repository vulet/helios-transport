import { PaymentV1, TokenBurnV1 } from '@helium/transactions';
import {
  bnSerialize, serializePaymentV1, serializeBurnV1
} from '../src/utils';
import {
  findJack, jill, quadrillionBones, ledgerPaymentV1Hex, ledgerBurnV1Hex
} from './__fixtures__/transport';

test('bnSerialize', async () => {
  const oneQuadrillionBones = bnSerialize(quadrillionBones).toString('hex');
  expect(oneQuadrillionBones).toEqual('0080c6a47e8d0300');
});

test('serializePaymentV1', async () => {
  const jack = await findJack();
  const transaction = new PaymentV1({
    payer: jack,
    payee: jill,
    amount: quadrillionBones,
    nonce: 1,
  });
  const serialized = serializePaymentV1(transaction);
  const result = serialized.toString('hex');
  expect(result).toEqual(ledgerPaymentV1Hex);
});

test('serializeBurnV1', async () => {
  const jack = await findJack();
  const transaction = new TokenBurnV1({
    payer: jack,
    payee: jill,
    amount: 1,
    nonce: 1,
    memo: 'bW9ja21lbW8=',
  });
  const serialized = serializeBurnV1(transaction);
  const result = serialized.toString('hex');
  expect(result).toEqual(ledgerBurnV1Hex);
});
