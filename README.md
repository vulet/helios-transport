# helios-transport
Ledger Hardware Wallet HNT JavaScript bindings.

# Installation
`yarn add helios-transport`

# Examples
```javascript
import TransportBLE from '@ledgerhq/hw-transport-web-ble';
import TransportHID from '@ledgerhq/hw-transport-node-hid';
import { PaymentV1 } from '@helium/transactions';
import { Client } from '@helium/http';
import { HNT } from "helios-transport";

// start web Bluetooth connection
const hnt = await TransportBLE.create()
.then((transport) => new HNT(transport));

// start node USB connection
const hnt = await TransportHID.create()
.then((transport) => new HNT(transport));

// publicKey
const publicKey = await hnt.getPublicKey().then(o => o.publicKey);
// base58 address
const base58Address = await hnt.getPublicKey().then(o => o.b58);

// prepare helium-js transaction
const paymentTxn = new PaymentV1({
  payer: bob.address,
  payee: alice,
  amount: 10,
  nonce: account.speculativeNonce + 1,
});

// create Ledger signature
const signedTxn = await hnt.signTransaction(paymentTxn);
paymentTxn.signature = signedTxn.signature;

// submit transaction
const client = new Client();
client.transactions.submit(paymentTxn.toString());
```
# Contributors
This project is made great by its [contributors](https://github.com/vulet/helios-transport/graphs/contributors).
