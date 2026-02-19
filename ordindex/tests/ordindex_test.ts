
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';

Clarinet.test({
    name: "create-collection: creates new collection and increments nonce",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;

        let block = chain.mineBlock([
            Tx.contractCall('ordindex', 'create-collection', [types.utf8("Stacks Punks")], wallet1.address)
        ]);

        block.receipts[0].result.expectOk().expectUint(1);
    }
});

Clarinet.test({
    name: "register-ordinal: links to collection and increments supply",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;

        // Create collection (ID 1)
        chain.mineBlock([
            Tx.contractCall('ordindex', 'create-collection', [types.utf8("Stacks Punks")], wallet1.address)
        ]);

        let block = chain.mineBlock([
            Tx.contractCall('ordindex', 'register-ordinal', [
                types.uint(100),
                types.utf8("ipfs://metadata"),
                types.some(types.uint(1))
            ], wallet1.address)
        ]);

        block.receipts[0].result.expectOk().expectBool(true);

        // Verify supply
        const collection = chain.callReadOnlyFn('ordindex', 'get-collection', [types.uint(1)], wallet1.address);
        const data = collection.result.expectSome().expectTuple();
        assertEquals(data['total-supply'], types.uint(1));
    }
});

Clarinet.test({
    name: "remove-ordinal: admin can remove and decrement supply",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;

        // Create & Register
        chain.mineBlock([
            Tx.contractCall('ordindex', 'create-collection', [types.utf8("Stacks Punks")], wallet1.address),
            Tx.contractCall('ordindex', 'register-ordinal', [
                types.uint(100), types.utf8("ipfs://metadata"), types.some(types.uint(1))
            ], wallet1.address)
        ]);

        let block = chain.mineBlock([
            Tx.contractCall('ordindex', 'remove-ordinal', [types.uint(100)], deployer.address)
        ]);

        block.receipts[0].result.expectOk().expectBool(true);

        // Verify supply is back to 0
        const collection = chain.callReadOnlyFn('ordindex', 'get-collection', [types.uint(1)], wallet1.address);
        const data = collection.result.expectSome().expectTuple();
        assertEquals(data['total-supply'], types.uint(0));
    }
});
