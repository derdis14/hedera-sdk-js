import {
    TokenCreateTransaction,
    TokenDeleteTransaction,
    TokenInfoQuery,
    Status,
    PrivateKey,
} from "../src/exports.js";
import IntegrationTestEnv from "./client/index.js";

describe("TokenCreate", function () {
    it("should be executable", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();
        const operatorId = env.operatorId;
        const operatorKey = env.operatorKey.publicKey;
        const key1 = PrivateKey.generate();
        const key2 = PrivateKey.generate();
        const key3 = PrivateKey.generate();
        const key4 = PrivateKey.generate();

        const response = await new TokenCreateTransaction()
            .setTokenName("ffff")
            .setTokenSymbol("F")
            .setDecimals(3)
            .setInitialSupply(1000000)
            .setTreasuryAccountId(operatorId)
            .setAdminKey(operatorKey)
            .setKycKey(key1)
            .setFreezeKey(key2)
            .setWipeKey(key3)
            .setSupplyKey(key4)
            .setFreezeDefault(false)
            .execute(env.client);

        const tokenId = (await response.getReceipt(env.client)).tokenId;

        const info = await new TokenInfoQuery()
            .setTokenId(tokenId)
            .execute(env.client);

        expect(info.tokenId.toString()).to.eql(tokenId.toString());
        expect(info.name).to.eql("ffff");
        expect(info.symbol).to.eql("F");
        expect(info.decimals).to.eql(3);
        expect(info.totalSupply.toInt()).to.eql(1000000);
        expect(info.treasuryAccountId.toString()).to.be.equal(
            operatorId.toString()
        );
        expect(info.adminKey.toString()).to.eql(operatorKey.toString());
        expect(info.kycKey.toString()).to.eql(key1.publicKey.toString());
        expect(info.freezeKey.toString()).to.eql(key2.publicKey.toString());
        expect(info.wipeKey.toString()).to.eql(key3.publicKey.toString());
        expect(info.supplyKey.toString()).to.eql(key4.publicKey.toString());
        expect(info.defaultFreezeStatus).to.be.false;
        expect(info.defaultKycStatus).to.be.false;
        expect(info.isDeleted).to.be.false;
        expect(info.autoRenewAccountId).to.be.not.null;
        expect(info.autoRenewAccountId.toString()).to.be.eql(
            operatorId.toString()
        );
        expect(info.autoRenewPeriod).to.be.not.null;
        expect(info.autoRenewPeriod.seconds.toInt()).to.be.eql(7776000);
        expect(info.expirationTime).to.be.not.null;

        await env.close({ token: tokenId });
    });

    it("should be executable with minimal properties set", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new({ throwaway: true });
        const operatorId = env.operatorId;

        const response = await new TokenCreateTransaction()
            .setTokenName("ffff")
            .setTokenSymbol("F")
            .setTreasuryAccountId(operatorId)
            .execute(env.client);

        const tokenId = (await response.getReceipt(env.client)).tokenId;

        const info = await new TokenInfoQuery()
            .setTokenId(tokenId)
            .execute(env.client);

        expect(info.tokenId.toString()).to.eql(tokenId.toString());
        expect(info.name).to.eql("ffff");
        expect(info.symbol).to.eql("F");
        expect(info.decimals).to.eql(0);
        expect(info.totalSupply.toInt()).to.eql(0);
        expect(info.treasuryAccountId.toString()).to.be.equal(
            operatorId.toString()
        );
        expect(info.adminKey).to.be.null;
        expect(info.kycKey).to.be.null;
        expect(info.freezeKey).to.be.null;
        expect(info.wipeKey).to.be.null;
        expect(info.supplyKey).to.be.null;
        expect(info.defaultFreezeStatus).to.be.null;
        expect(info.defaultKycStatus).to.be.null;
        expect(info.isDeleted).to.be.false;
        expect(info.autoRenewAccountId).to.be.not.null;
        expect(info.autoRenewAccountId.toString()).to.be.eql(
            operatorId.toString()
        );
        expect(info.autoRenewPeriod).to.be.not.null;
        expect(info.autoRenewPeriod.seconds.toInt()).to.be.eql(7776000);
        expect(info.expirationTime).to.be.not.null;

        let err = false;

        try {
            await (
                await new TokenDeleteTransaction()
                    .setTokenId(tokenId)
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.TokenIsImmutable);
        }

        if (!err) {
            throw new Error("token deletion did not error");
        }

        await env.close();
    });

    it("should error when token name is not set", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();
        const operatorId = env.operatorId;

        let err = false;

        try {
            await (
                await new TokenCreateTransaction()
                    .setTokenSymbol("F")
                    .setTreasuryAccountId(operatorId)
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.MissingTokenName);
        }

        if (!err) {
            throw new Error("token creation did not error");
        }

        await env.close();
    });

    it("should error when token symbol is not set", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();
        const operatorId = env.operatorId;

        let err = false;

        try {
            await (
                await new TokenCreateTransaction()
                    .setTokenName("ffff")
                    .setTreasuryAccountId(operatorId)
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.MissingTokenSymbol);
        }

        if (!err) {
            throw new Error("token creation did not error");
        }

        await env.close();
    });

    it("should error when treasury account ID is not set", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        let err = false;

        try {
            await (
                await new TokenCreateTransaction()
                    .setTokenName("ffff")
                    .setTokenSymbol("F")
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error
                .toString()
                .includes(Status.InvalidTreasuryAccountForToken);
        }

        if (!err) {
            throw new Error("token creation did not error");
        }

        await env.close();
    });

    it("should error when admin key does not sign transaction", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();
        const operatorId = env.operatorId;

        let err = false;

        try {
            await (
                await new TokenCreateTransaction()
                    .setTokenName("ffff")
                    .setTokenSymbol("F")
                    .setTreasuryAccountId(operatorId)
                    .setAdminKey(PrivateKey.generate())
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidSignature);
        }

        if (!err) {
            throw new Error("token creation did not error");
        }

        await env.close();
    });
});
