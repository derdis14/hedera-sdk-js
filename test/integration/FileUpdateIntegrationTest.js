import FileCreateTransaction from "../src/file/FileCreateTransaction.js";
import FileDeleteTransaction from "../src/file/FileDeleteTransaction.js";
import FileUpdateTransaction from "../src/file/FileUpdateTransaction.js";
import FileInfoQuery from "../src/file/FileInfoQuery.js";
import Hbar from "../src/Hbar.js";
import Status from "../src/Status.js";
import IntegrationTestEnv from "./client/index.js";

describe("FileUpdate", function () {
    it("should be executable", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();
        const operatorKey = env.operatorKey.publicKey;

        let response = await new FileCreateTransaction()
            .setKeys([operatorKey])
            .setContents("[e2e::FileCreateTransaction]")
            .execute(env.client);

        let receipt = await response.getReceipt(env.client);

        expect(receipt.fileId).to.not.be.null;
        expect(receipt.fileId != null ? receipt.fileId.num > 0 : false).to.be
            .true;

        const file = receipt.fileId;

        let info = await new FileInfoQuery()
            .setFileId(file)
            .setQueryPayment(new Hbar(22))
            .execute(env.client);

        expect(info.fileId.toString()).to.be.equal(file.toString());
        expect(info.size.toInt()).to.be.equal(28);
        expect(info.isDeleted).to.be.false;

        // There should only be one key
        for (const key of info.keys) {
            expect(key.toString()).to.be.equal(operatorKey.toString());
        }

        await (
            await new FileUpdateTransaction()
                .setFileId(file)
                .setContents("[e2e::FileUpdateTransaction]")
                .execute(env.client)
        ).getReceipt(env.client);

        info = await new FileInfoQuery()
            .setFileId(file)
            .setQueryPayment(new Hbar(22))
            .execute(env.client);

        expect(info.fileId.toString()).to.be.equal(file.toString());
        expect(info.size.toInt()).to.be.equal(28);
        expect(info.isDeleted).to.be.false;

        // There should only be one key
        for (const key of info.keys) {
            expect(key.toString()).to.be.equal(operatorKey.toString());
        }

        await (
            await new FileDeleteTransaction()
                .setFileId(file)
                .execute(env.client)
        ).getReceipt(env.client);

        await env.close();
    });

    it("should error when file ID is not set", async function () {
        this.timeout(60000);

        const env = await IntegrationTestEnv.new();

        let err = false;

        try {
            await (
                await new FileUpdateTransaction()
                    .setContents("[e2e::FileUpdateTransaction]")
                    .execute(env.client)
            ).getReceipt(env.client);
        } catch (error) {
            err = error.toString().includes(Status.InvalidFileId);
        }

        if (!err) {
            throw new Error("file update did not error");
        }

        await env.close();
    });
});
