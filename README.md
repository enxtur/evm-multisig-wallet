## Multisig wallet

#### Introducing a secure multisig wallet smart contract for the Ethereum network. Only administrators have the ability to create proposals for adding or removing members, changing the output address, or making transactions to the output address. Members can then accept or reject these proposals, ensuring collective decision-making for the management of funds. Upgrade the security of your assets with this feature-rich multisig wallet solution.

```sh
npm install -g truffle
npm install
```

```sh
npm test
```


### Deploying

```sh
truffle dashboard
```

```sh
truffle migrate --network dashboard
```

### Interact to the contract
#### with truffle web3

```sh
truffle exec src/with-truffle.js --network dashboard
```
#### without truffle
```sh
node src/without-truffle.js
```
