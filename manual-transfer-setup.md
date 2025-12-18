# Manual Transfer Setup

## Off-Chain Keeper

**Architecture**: Minimal | AWS EventBridge or GH Actions → Serverless Lambda → sends on-chain transaction

**Important**: The keeper has its own wallet to post transactions

## RPC Endpoint

- Needed for sending and reading transactions ✅

## Allowance

Source wallet calls:

```solidity
USDC.approve(keeper_address, amount)
```

## Monitoring + Sweep

**Monitoring**:

- Listen for Transfer events, OR
- Poll balance

**Sweep**:
When balance ≥ threshold, call:

```solidity
USDC.transferFrom(source, safe, balance)
```

**Key Point**: Keeper wallet pays gas, source wallet private key stays secure.

## Mimic Demo

### Intro

As you can notice, this is a best effort execution setup, because your keeper might fail send a transaction, an RPC endpoint might hitting 429 or some other unseen circumstance. Besides, it requires a hefty doze of infrastructure setup even though AWS EventBridge and Lambda can replace the need for a full EC2 deployment.

Now, we can compare it to a relatively simple setup with guaranteed execution via Mimic. Mimic is a decentralized cross-chain blockchain automation layer that works in a non-custodial fashion and guaranteed the execution at the best conditions for the users. In the realm of Mimic, there is an execution unit called Task (in our case, it's a token transfer we want to establish on the condition when the balance reaches a certain threshold). Mimic can monitor that task and once the conditions are reached, it will generate an intent which gets picked up and fulfilled by solvers. Without diving too deep into Mimic's three layer architecture, let's see how easy it is to code such a task without any need for manual infrastructure configuration, provisioning, and sending on-chain transactions.

### Switch over to terminal

- start from scratch
- run `mimic init -d usdc-sweeper`
- show the `manifest.yaml`. Explain briefly the inputs, and two other. Then modify it for our task
- then edit the task.ts file to code the logic live
- then run `mimic codegen`
- then run `mimic compile`
- start the `explorer-ui`
- run `mimic deploy` which will re-compile everything and deploy the task template
- teleport to the explorer-ui and create an actual task and sign
- show that it's active
- then top off the account and wait for the task to transfer the entire amount!
- Done!

## Talking points

### Problem

Let's say you have multiple wallets and want to monitor a specific token (show multiple tokens with two having over $5 balance - due for sweeping). I’m using a stablecoin in this example just to keep things simple(mark as USDC). When a wallet’s balance crosses a set threshold, you automatically sweep the entire amount into a consolidation wallet (animation of a broom sweeping up the stablecoin from those two wallets, Mimic being the janitor and doing all the dirty work).

Why would you want to do it?

- avoid asset fragmentation
- Move funds only when it's economically sensible

### Solution

An off-chain sweeper bot monitors wallet balances and automatically consolidates funds into a single wallet once a threshold is reached.

### Clarify demo setup

The demo will include monitoring USDC on Arbitrum in a single wallet. It can be replicated to other wallets by configuring the same task with different config values. We will use Mimic CLI tool (show Mimic CLI gif blinking on the background rotating through the required commands `mimic init -d sweeper_agent`, `mimic codegen`, `mimic deploy`)
