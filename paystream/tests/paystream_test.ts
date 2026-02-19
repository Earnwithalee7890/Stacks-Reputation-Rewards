// Paystream — Clarinet Test Suite
// Covers stream creation, withdrawal, pause/resume, and cancellation

import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';

Clarinet.test({
    name: "create-stream: sender can create a stream and STX is locked in contract",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const alice = accounts.get('deployer')!;
        const bob = accounts.get('wallet_1')!;

        let block = chain.mineBlock([
            Tx.contractCall('paystream', 'create-stream', [
                types.principal(bob.address),
                types.uint(10_000_000),  // 10 STX
                types.uint(100),          // 100 blocks
                types.none()
            ], alice.address)
        ]);

        block.receipts[0].result.expectOk().expectUint(1); // first stream ID = 1
        assertEquals(block.receipts[0].events.length, 2); // transfer + protocol fee
    }
});

Clarinet.test({
    name: "withdraw: recipient can withdraw claimable STX after blocks pass",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const alice = accounts.get('deployer')!;
        const bob = accounts.get('wallet_1')!;

        chain.mineBlock([
            Tx.contractCall('paystream', 'create-stream', [
                types.principal(bob.address),
                types.uint(10_000_000),
                types.uint(100),
                types.none()
            ], alice.address)
        ]);

        // Advance 50 blocks
        chain.mineEmptyBlock(50);

        let block = chain.mineBlock([
            Tx.contractCall('paystream', 'withdraw', [types.uint(1)], bob.address)
        ]);

        block.receipts[0].result.expectOk();
    }
});

Clarinet.test({
    name: "pause-stream: sender can pause, recipient cannot withdraw while paused",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const alice = accounts.get('deployer')!;
        const bob = accounts.get('wallet_1')!;

        chain.mineBlock([
            Tx.contractCall('paystream', 'create-stream', [
                types.principal(bob.address),
                types.uint(5_000_000),
                types.uint(50),
                types.some(types.utf8("Salary Q1 2025"))
            ], alice.address)
        ]);

        chain.mineEmptyBlock(10);

        // Alice pauses
        let pauseBlock = chain.mineBlock([
            Tx.contractCall('paystream', 'pause-stream', [types.uint(1)], alice.address)
        ]);
        pauseBlock.receipts[0].result.expectOk();

        // Bob tries to withdraw while paused → should fail
        let withdrawBlock = chain.mineBlock([
            Tx.contractCall('paystream', 'withdraw', [types.uint(1)], bob.address)
        ]);
        withdrawBlock.receipts[0].result.expectErr().expectUint(105); // err-stream-paused
    }
});

Clarinet.test({
    name: "resume-stream: sender can resume a paused stream",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const alice = accounts.get('deployer')!;
        const bob = accounts.get('wallet_1')!;

        chain.mineBlock([
            Tx.contractCall('paystream', 'create-stream', [
                types.principal(bob.address),
                types.uint(5_000_000),
                types.uint(50),
                types.none()
            ], alice.address)
        ]);

        chain.mineBlock([
            Tx.contractCall('paystream', 'pause-stream', [types.uint(1)], alice.address)
        ]);

        let block = chain.mineBlock([
            Tx.contractCall('paystream', 'resume-stream', [types.uint(1)], alice.address)
        ]);

        block.receipts[0].result.expectOk().expectBool(true);
    }
});

Clarinet.test({
    name: "cancel-stream: sender can cancel and recover unstreamed balance",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const alice = accounts.get('deployer')!;
        const bob = accounts.get('wallet_1')!;

        chain.mineBlock([
            Tx.contractCall('paystream', 'create-stream', [
                types.principal(bob.address),
                types.uint(10_000_000),
                types.uint(1000),
                types.none()
            ], alice.address)
        ]);

        // Cancel right away — most balance should be returned
        let block = chain.mineBlock([
            Tx.contractCall('paystream', 'cancel-stream', [types.uint(1)], alice.address)
        ]);

        block.receipts[0].result.expectOk().expectBool(true);
    }
});
