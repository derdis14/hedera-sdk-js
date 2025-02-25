require("dotenv").config();

const {
    Client,
    AccountInfoQuery,
    Hbar,
    AccountId,
    PrivateKey,
} = require("@hashgraph/sdk");

async function main() {
    let client;

    try {
        client = Client.forName(process.env.HEDERA_NETWORK).setOperator(
            AccountId.fromString(process.env.OPERATOR_ID),
            PrivateKey.fromString(process.env.OPERATOR_KEY)
        );
    } catch {
        throw new Error(
            "Environment variables HEDERA_NETWORK, OPERATOR_ID, and OPERATOR_KEY are required."
        );
    }

    const info = await new AccountInfoQuery()
        .setAccountId(client.operatorAccountId)
        .setQueryPayment(new Hbar(1))
        .execute(client);

    console.log(`info.key                          = ${info.key}`);

    console.log(
        `info.isReceiverSignatureRequired  =`,
        info.isReceiverSignatureRequired
    );

    console.log(
        `info.expirationTime               = ${info.expirationTime.toDate()}`
    );
}

void main();
