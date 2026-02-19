
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import {
    makeContractCall,
    broadcastTransaction,
    callReadOnlyFunction,
    uintCV,
    standardPrincipalCV,
    stringUtf8CV,
    someCV,
    noneCV,
    AnchorMode,
    PostConditionMode,
    cvToJSON
} from '@stacks/transactions';

export interface OrdIndexConfig {
    contractAddress: string;
    contractName: string;
    network: 'mainnet' | 'testnet';
}

export class OrdIndexSDK {
    private config: OrdIndexConfig;
    private network: StacksMainnet | StacksTestnet;

    constructor(config: OrdIndexConfig) {
        this.config = config;
        this.network = config.network === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
    }

    /** Create a new collection (returns collection-id). */
    async createCollection(name: string, senderKey: string): Promise<string> {
        const tx = await makeContractCall({
            contractAddress: this.config.contractAddress,
            contractName: this.config.contractName,
            functionName: 'create-collection',
            functionArgs: [stringUtf8CV(name)],
            senderKey,
            network: this.network,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
        });
        const result = await broadcastTransaction(tx, this.network);
        return result.txid;
    }

    /** Register an ordinal, optionally linked to a collection. */
    async registerOrdinal(inscriptionId: number, metadataUri: string, collectionId: number | null, senderKey: string): Promise<string> {
        const tx = await makeContractCall({
            contractAddress: this.config.contractAddress,
            contractName: this.config.contractName,
            functionName: 'register-ordinal',
            functionArgs: [
                uintCV(inscriptionId),
                stringUtf8CV(metadataUri),
                collectionId ? someCV(uintCV(collectionId)) : noneCV()
            ],
            senderKey,
            network: this.network,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
        });
        const result = await broadcastTransaction(tx, this.network);
        return result.txid;
    }

    /** Transfer ownership of a registered ordinal. */
    async transferOrdinal(inscriptionId: number, recipient: string, senderKey: string): Promise<string> {
        const tx = await makeContractCall({
            contractAddress: this.config.contractAddress,
            contractName: this.config.contractName,
            functionName: 'transfer-ordinal',
            functionArgs: [
                uintCV(inscriptionId),
                standardPrincipalCV(recipient)
            ],
            senderKey,
            network: this.network,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Allow,
        });
        const result = await broadcastTransaction(tx, this.network);
        return result.txid;
    }

    /** Get ordinal details. */
    async getOrdinal(inscriptionId: number): Promise<any> {
        const result = await callReadOnlyFunction({
            contractAddress: this.config.contractAddress,
            contractName: this.config.contractName,
            functionName: 'get-ordinal',
            functionArgs: [uintCV(inscriptionId)],
            network: this.network,
            senderAddress: this.config.contractAddress,
        });
        return cvToJSON(result);
    }
}
