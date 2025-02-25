import AccountCreateTransaction from "../src/account/AccountCreateTransaction.js";
import AccountDeleteTransaction from "../src/account/AccountDeleteTransaction.js";
import AccountUpdateTransaction from "../src/account/AccountUpdateTransaction.js";
import AccountInfoQuery from "../src/account/AccountInfoQuery.js";
import Hbar from "../src/Hbar.js";
import Timestamp from "../src/Timestamp.js";
import Status from "../src/Status.js";
import TransactionId from "../../src/transaction/TransactionId.js";
import IntegrationTestEnv from "./client/index.js";
import { PrivateKey } from "../src/index.js";
import Long from "long";

describe("AccountUpdate", function () {
    it("should be executable", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();
        const operatorId = env.operatorId;

        const key1 = PrivateKey.generate();
        const key2 = PrivateKey.generate();

        let response = await new AccountCreateTransaction()
            .setKey(key1.publicKey)
            .setInitialBalance(new Hbar(2))
            .execute(env.client);

        const receipt = await response.getReceipt(env.client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        let info = await new AccountInfoQuery()
            .setAccountId(account)
            .execute(env.client);

        expect(info.accountId.toString()).to.be.equal(account.toString());
        expect(info.isDeleted).to.be.false;
        expect(info.key.toString()).to.be.equal(key1.publicKey.toString());
        expect(info.balance.toTinybars().toInt()).to.be.equal(
            new Hbar(2).toTinybars().toInt()
        );
        expect(info.autoRenewPeriod.seconds.toNumber()).to.be.equal(7776000);
        expect(info.proxyAccountId).to.be.null;
        expect(info.proxyReceived.toTinybars().toInt()).to.be.equal(0);

        response = await (
            await (
                await new AccountUpdateTransaction()
                    .setAccountId(account)
                    .setKey(key2.publicKey)
                    // .setAutoRenewPeriod(777600000)
                    // .setExpirationTime(new Date(Date.now() + 7776000000))
                    .freezeWith(env.client)
                    .sign(key1)
            ).sign(key2)
        ).execute(env.client);

        await response.getReceipt(env.client);

        info = await new AccountInfoQuery()
            .setAccountId(account)
            .execute(env.client);

        expect(info.accountId.toString()).to.be.equal(account.toString());
        expect(info.isDeleted).to.be.false;
        expect(info.key.toString()).to.be.equal(key2.publicKey.toString());
        expect(info.balance.toTinybars().toInt()).to.be.equal(
            new Hbar(2).toTinybars().toInt()
        );
        expect(info.autoRenewPeriod.seconds.toNumber()).to.be.equal(7776000);
        expect(info.proxyAccountId).to.be.null;
        expect(info.proxyReceived.toTinybars().toInt()).to.be.equal(0);

        await (
            await (
                await new AccountDeleteTransaction()
                    .setAccountId(account)
                    .setTransferAccountId(operatorId)
                    .setTransactionId(TransactionId.generate(account))
                    .freezeWith(env.client)
                    .sign(key2)
            ).execute(env.client)
        ).getReceipt(env.client);
    });

    it("should error with invalid auto renew period", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        const key1 = PrivateKey.generate();
        const key2 = PrivateKey.generate();

        let response = await new AccountCreateTransaction()
            .setKey(key1.publicKey)
            .setInitialBalance(new Hbar(2))
            .execute(env.client);

        const receipt = await response.getReceipt(env.client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        let err = false;

        try {
            await (
                await (
                    await (
                        await new AccountUpdateTransaction()
                            .setAccountId(account)
                            .setKey(key2.publicKey)
                            .setAutoRenewPeriod(777600000)
                            .freezeWith(env.client)
                            .sign(key1)
                    ).sign(key2)
                ).execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error
                .toString()
                .includes(Status.AutorenewDurationNotInRange.toString());
        }

        await (
            await (
                await new AccountDeleteTransaction()
                    .setAccountId(account)
                    .setTransferAccountId(env.client.operatorAccountId)
                    .setTransactionId(TransactionId.generate(account))
                    .freezeWith(env.client)
                    .sign(key1)
            ).execute(env.client)
        ).getReceipt(env.client);

        if (!err) {
            throw new Error("account update did not error");
        }
    });

    // eslint-disable-next-line mocha/no-skipped-tests
    it.skip("should error with insufficent tx fee when a large expiration time is set", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        const key1 = PrivateKey.generate();
        const key2 = PrivateKey.generate();

        let response = await new AccountCreateTransaction()
            .setKey(key1.publicKey)
            .setInitialBalance(new Hbar(2))
            .execute(env.client);

        const receipt = await response.getReceipt(env.client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        let err = false;

        try {
            await (
                await (
                    await (
                        await new AccountUpdateTransaction()
                            .setAccountId(account)
                            .setKey(key2.publicKey)
                            .setExpirationTime(new Timestamp(Long.MAX, 0))
                            .freezeWith(env.client)
                            .sign(key1)
                    ).sign(key2)
                ).execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error
                .toString()
                .includes(Status.InsufficientTxFee.toString());
        }

        if (!err) {
            throw new Error("account update did not error");
        }
    });

    it("should error when account ID is not set", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        let err = false;

        try {
            await (
                await new AccountUpdateTransaction()
                    .setKey(env.client.operatorPublicKey)
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidAccountId.toString());
        }

        if (!err) {
            throw new Error("account update did not error");
        }
    });

    it("should execute with only account ID", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        const key1 = PrivateKey.generate();

        let response = await new AccountCreateTransaction()
            .setKey(key1.publicKey)
            .setInitialBalance(new Hbar(2))
            .execute(env.client);

        const receipt = await response.getReceipt(env.client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        await (
            await (
                await new AccountUpdateTransaction()
                    .setAccountId(account)
                    .freezeWith(env.client)
                    .sign(key1)
            ).execute(env.client)
        ).getReceipt(env.client);

        await (
            await (
                await new AccountDeleteTransaction()
                    .setAccountId(account)
                    .setTransferAccountId(env.client.operatorAccountId)
                    .setTransactionId(TransactionId.generate(account))
                    .freezeWith(env.client)
                    .sign(key1)
            ).execute(env.client)
        ).getReceipt(env.client);

        await env.close();
    });

    it("should error with invalid signature", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        const key1 = PrivateKey.generate();
        const key2 = PrivateKey.generate();

        let response = await new AccountCreateTransaction()
            .setKey(key1.publicKey)
            .setInitialBalance(new Hbar(2))
            .execute(env.client);

        const receipt = await response.getReceipt(env.client);

        expect(receipt.accountId).to.not.be.null;
        const account = receipt.accountId;

        let err = false;

        try {
            await (
                await (
                    await new AccountUpdateTransaction()
                        .setAccountId(account)
                        .setKey(key2.publicKey)
                        .freezeWith(env.client)
                        .sign(key1)
                ).execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidSignature.toString());
        }

        await (
            await (
                await new AccountDeleteTransaction()
                    .setAccountId(account)
                    .setTransferAccountId(env.client.operatorAccountId)
                    .setTransactionId(TransactionId.generate(account))
                    .freezeWith(env.client)
                    .sign(key1)
            ).execute(env.client)
        ).getReceipt(env.client);

        if (!err) {
            throw new Error("account update did not error");
        }

        await env.close();
    });
});
