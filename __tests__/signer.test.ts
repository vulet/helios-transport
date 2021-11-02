import { PaymentV1, TokenBurnV1 } from '@helium/transactions';
import { openTransportReplayer, RecordStore } from '@ledgerhq/hw-transport-mocker';
import { findJack, jill, paymentV1ToBase64, burnV1ToBase64 } from './__fixtures__/transport';
import HNT from '../src/helios-transport';

test('signPaymentV1 to base64', async () => {
  const jack = await findJack();
  const transport = await openTransportReplayer(
    RecordStore.fromString(`
    => e00800003a0100000000000000000000000000000001000000000000000001d9b3598179022ca9922be5688cd4b0cc50512feefa2bfc831a345eda911b3c9a
    <= 3044022041673ea6da17205b9b0d279436b508cd092b686bf5b921ddf4fbf38879e4950402207510cebf32019f5d994102bfe6570bb2f5d0b931902ad6d839c5b4552a492cb99000
    `),
  );
  const hnt = new HNT(transport);
  const transaction = new PaymentV1({
    payer: jack,
    payee: jill,
    amount: 1,
    nonce: 1,
  });
  const result = await hnt.signPaymentV1(transaction);
  transaction.signature = result.signature;
  expect(transaction.toString()).toEqual(paymentV1ToBase64);
});

test('signBurnV1 to base64', async () => {
  const jack = await findJack();
  const transport = await openTransportReplayer(
    RecordStore.fromString(`
      => e00c00004201000000000000000000000000000000010000000000000000000000000000000001d9b3598179022ca9922be5688cd4b0cc50512feefa2bfc831a345eda911b3c9a
      <= 0a2101a1897ba94eb70be71a64322e44a42c09649d6fe6446d09df7a6945fbe80c0baf122101d9b3598179022ca9922be5688cd4b0cc50512feefa2bfc831a345eda911b3c9a180120012a40c3485adafa4a4333e1c36609774e6a4579d4949194018679f12559bd7bd0d780133b3fce7d280c1b5fc97284cc481f163b1cc912f9d5437324846144afe2890330b0ea019000
      `,
    )
  );
  const hnt = new HNT(transport);
  const transaction = new TokenBurnV1({
    payer: jack,
    payee: jill,
    amount: 1,
    nonce: 1,
    memo: 'AAAAAAAAAAA=',
  });
  const result = await hnt.signBurnV1(transaction);
  transaction.signature = result.signature
  expect(transaction.toString()).toEqual(burnV1ToBase64);
});
