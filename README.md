# Anthill Frontend

This is front-end repository of the Anthill

## 🚄 🐜 TLDR

There is a more detailed explanation in the next section.

Follow the steps in [Anthill Contracts](https://github.com/theanthill/anthill-contracts) to deploy the contracts to the local blockchain and generate the deployment JSON. Then you
can do:

```
 $ yarn
 $ cp ../anthill-contracts/build/*.json anthill-frontend/src/anthill/deployments/
 $ yarn start:local-testnet
```

## 💻 🐜 Set Up Environment

To begin, you need to install dependencies with Yarn.

```
$ yarn
```

## 💻 🐜 Compiling the contracts

This is explained in the [Anthill Contracts README](https://github.com/theanthill/anthill-contracts/blob/master/README.md).

## 🗎 🐜 Connecting the contracts

Once you've compiled the contracts in the [contracts](https://github.com/theanthill/anthill-contracts) repository you must copy the deployment file to the frontend project:

```
 $ cp ../anthill-contracts/build/*.json anthill-frontend/src/anthill/deployments/
```

## 🕸 🐜 Running the frontend

You can launch the development server with following command.

```
 $ yarn start
```

The frontend will open in the browser on `http://localhost:3000`. You should see the number of available ANT and ANT Bond, plus their prices.

_© Copyright 2021, The Anthill_
