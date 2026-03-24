## Slide 1
In this video, I’ll present two approaches for the use case of automatically sweeping a token once it exceeds a threshold.

It could be any ERC20 token on an EVM chain, but I picked USDC to keep it simple.

## Slide 2
So, imagine you have a wallet that frequently receives USDC.

You don’t want to keep checking it just to move the funds.

## Slide 3
You’d rather have the tokens automatically sent to a consolidation wallet, where they can be put to work in yield or lending protocols instead of sitting idle.

## Slide 4
One way to do this is with an off-chain keeper that sweeps any tokens above a set threshold.

## Slide 5
1. You would need to give this keeper a wallet and approve it to spend your tokens

2. Then make it listen for transfer events from the USDC smart contract or just poll for the balance once in a while.

3. The keeper will then compare the balance to the threshold and send a transaction to transfer USDC to the consolidation wallet.

As you could see, there are quite a few steps involved here and this is still best effort execution. No guarantees.

## Slide 6
To guarantee the outcome reliably, we can use Mimic blockchain automation protocol.

Mimic handles all off-chain infrastructure and only leaves us to define what happens on-chain and when.

Don't get intimidated by this orbital diagram. Mimic abstracts all this away.

## Slide 7
You only express the logic in Assembly script along with the inputs available and submit it to the planning layer which is the most inner orbit on the previous orbital diagram.

The re-layers pick up and start watching your task.

## Slide 8
If conditions are satisfied, an intent gets generated and handed over to the execution layer represented by the middle orbit.

## Slide 9
The most outer orbit is the Security Layer, which enforces correctness and validity of executions on-chain.
