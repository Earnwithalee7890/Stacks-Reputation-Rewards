import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure that a builder can register with a github handle",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet_1 = accounts.get("wallet_1")!;
        const githubHandle = "stacks-builder-hero";

        let block = chain.mineBlock([
            Tx.contractCall("proof-of-builder", "register-builder", [types.ascii(githubHandle)], wallet_1.address)
        ]);

        assertEquals(block.receipts.length, 1);
        assertEquals(block.height, 2);
        block.receipts[0].result.expectOk().expectBool(true);

        // Check if map contains the profile
        let profile = chain.callReadOnlyFn("proof-of-builder", "get-builder", [types.principal(wallet_1.address)], wallet_1.address);
        profile.result.expectSome().expectTuple();
    },
});
