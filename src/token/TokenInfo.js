import TokenId from "./TokenId.js";
import AccountId from "../account/AccountId.js";
import { keyFromProtobuf, keyToProtobuf } from "../cryptography/protobuf.js";
import Duration from "../Duration.js";
import Timestamp from "../Timestamp.js";
import Long from "long";
import * as proto from "@hashgraph/proto";
import TokenType from "./TokenType.js";
import TokenSupplyType from "./TokenSupplyType.js";
import CustomFixedFee from "./CustomFixedFee.js";
import CustomFractionalFee from "./CustomFractionalFee.js";
import CustomRoyaltyFee from "./CustomRoyaltyFee.js";

/**
 * @typedef {import("@hashgraph/cryptography").Key} Key
 * @typedef {import("./CustomFee.js").default} CustomFee
 */

/**
 * Response when the client sends the node TokenGetInfoQuery.
 */
export default class TokenInfo {
    /**
     * @private
     * @param {object} props
     * @param {TokenId} props.tokenId;
     * @param {string} props.name;
     * @param {string} props.symbol;
     * @param {number} props.decimals;
     * @param {Long} props.totalSupply;
     * @param {AccountId | null} props.treasuryAccountId;
     * @param {Key | null} props.adminKey;
     * @param {Key | null} props.kycKey;
     * @param {Key | null} props.freezeKey;
     * @param {Key | null} props.wipeKey;
     * @param {Key | null} props.supplyKey;
     * @param {Key | null} props.feeScheduleKey;
     * @param {boolean | null} props.defaultFreezeStatus;
     * @param {boolean | null} props.defaultKycStatus;
     * @param {boolean} props.isDeleted;
     * @param {AccountId | null} props.autoRenewAccountId;
     * @param {Duration | null} props.autoRenewPeriod;
     * @param {Timestamp | null} props.expirationTime;
     * @param {string} props.tokenMemo;
     * @param {CustomFee[]} props.customFees;
     * @param {TokenType | null} props.tokenType;
     * @param {TokenSupplyType | null} props.supplyType;
     * @param {Long | null} props.maxSupply;
     */
    constructor(props) {
        /**
         * ID of the token instance
         *
         * @readonly
         */
        this.tokenId = props.tokenId;

        /**
         * The name of the token. It is a string of ASCII only characters
         *
         * @readonly
         */
        this.name = props.name;

        /**
         * The symbol of the token. It is a UTF-8 capitalized alphabetical string
         *
         * @readonly
         */
        this.symbol = props.symbol;

        /**
         * The number of decimal places a token is divisible by
         *
         * @readonly
         */
        this.decimals = props.decimals;

        /**
         * The total supply of tokens that are currently in circulation
         *
         * @readonly
         */
        this.totalSupply = props.totalSupply;

        /**
         * The ID of the account which is set as treasuryAccountId
         *
         * @readonly
         */
        this.treasuryAccountId = props.treasuryAccountId;

        /**
         * The key which can perform update/delete operations on the token. If empty, the token can be perceived as
         * immutable (not being able to be updated/deleted)
         *
         * @readonly
         */
        this.adminKey = props.adminKey;

        /**
         * The key which can grant or revoke KYC of an account for the token's transactions. If empty, KYC is not required,
         * and KYC grant or revoke operations are not possible.
         *
         * @readonly
         */
        this.kycKey = props.kycKey;

        /**
         * The key which can freeze or unfreeze an account for token transactions. If empty, freezing is not possible
         *
         * @readonly
         */
        this.freezeKey = props.freezeKey;

        /**
         * The key which can wipe token balance of an account. If empty, wipe is not possible
         *
         * @readonly
         */
        this.wipeKey = props.wipeKey;

        /**
         * The key which can change the supply of a token. The key is used to sign Token Mint/Burn operations
         *
         * @readonly
         */
        this.supplyKey = props.supplyKey;

        this.feeScheduleKey = props.feeScheduleKey;

        /**
         * The default Freeze status (not applicable = null, frozen = false, or unfrozen = true) of Hedera accounts relative to this token.
         * FreezeNotApplicable is returned if Token Freeze Key is empty. Frozen is returned if Token Freeze Key is set and
         * defaultFreeze is set to true. Unfrozen is returned if Token Freeze Key is set and defaultFreeze is set to false
         *      FreezeNotApplicable = null;
         *      Frozen = true;
         *      Unfrozen = false;
         *
          @readonly */
        this.defaultFreezeStatus = props.defaultFreezeStatus;

        /**
         * The default KYC status (KycNotApplicable or Revoked) of Hedera accounts relative to this token. KycNotApplicable
         * is returned if KYC key is not set, otherwise Revoked
         *      KycNotApplicable = null;
         *      Granted = true;
         *      Revoked = false;
         *
         * @readonly
         */
        this.defaultKycStatus = props.defaultKycStatus;

        /**
         * Specifies whether the token was deleted or not
         *
         * @readonly
         */
        this.isDeleted = props.isDeleted;

        /**
         * An account which will be automatically charged to renew the token's expiration, at autoRenewPeriod interval
         *
         * @readonly
         */
        this.autoRenewAccountId = props.autoRenewAccountId;

        /**
         * The interval at which the auto-renew account will be charged to extend the token's expiry
         *
         * @readonly
         */
        this.autoRenewPeriod = props.autoRenewPeriod;

        /**
         * The epoch second at which the token expire: will; if an auto-renew account and period are specified,
         * this is coerced to the current epoch second plus the autoRenewPeriod
         *
         * @readonly
         */
        this.expirationTime = props.expirationTime;

        /**
         * The memo associated with the token.
         *
         * @readonly
         */
        this.tokenMemo = props.tokenMemo;

        this.customFees = props.customFees;

        this.tokenType = props.tokenType;

        this.supplyType = props.supplyType;

        this.maxSupply = props.maxSupply;
    }

    /**
     * @internal
     * @param {proto.ITokenInfo} info
     * @returns {TokenInfo}
     */
    static _fromProtobuf(info) {
        const defaultFreezeStatus = /** @type {proto.TokenFreezeStatus} */ (
            info.defaultFreezeStatus
        );
        const defaultKycStatus = /** @type {proto.TokenKycStatus} */ (
            info.defaultKycStatus
        );

        const autoRenewAccountId =
            info.autoRenewAccount != null
                ? AccountId._fromProtobuf(info.autoRenewAccount)
                : new AccountId(0);

        return new TokenInfo({
            tokenId: TokenId._fromProtobuf(
                /** @type {proto.ITokenID} */ (info.tokenId)
            ),
            name: /** @type {string} */ (info.name),
            symbol: /** @type {string} */ (info.symbol),
            decimals: /** @type {number} */ (info.decimals),
            totalSupply: Long.fromValue(/** @type {Long} */ (info.totalSupply)),
            treasuryAccountId:
                info.treasury != null
                    ? AccountId._fromProtobuf(
                          /** @type {proto.IAccountID} */ (info.treasury)
                      )
                    : null,
            adminKey:
                info.adminKey != null ? keyFromProtobuf(info.adminKey) : null,
            kycKey: info.kycKey != null ? keyFromProtobuf(info.kycKey) : null,
            freezeKey:
                info.freezeKey != null ? keyFromProtobuf(info.freezeKey) : null,
            wipeKey:
                info.wipeKey != null ? keyFromProtobuf(info.wipeKey) : null,
            supplyKey:
                info.supplyKey != null ? keyFromProtobuf(info.supplyKey) : null,
            feeScheduleKey:
                info.feeScheduleKey != null
                    ? keyFromProtobuf(info.feeScheduleKey)
                    : null,
            defaultFreezeStatus:
                defaultFreezeStatus === 0 ? null : defaultFreezeStatus == 1,
            defaultKycStatus:
                defaultKycStatus === 0 ? null : defaultKycStatus == 1,
            isDeleted: /** @type {boolean} */ (info.deleted),
            autoRenewAccountId: !(
                autoRenewAccountId.shard.toInt() == 0 &&
                autoRenewAccountId.realm.toInt() == 0 &&
                autoRenewAccountId.num.toInt() == 0
            )
                ? autoRenewAccountId
                : null,
            autoRenewPeriod:
                info.autoRenewPeriod != null
                    ? Duration._fromProtobuf(
                          /** @type {proto.IDuration} */ (info.autoRenewPeriod)
                      )
                    : null,
            expirationTime:
                info.expiry != null
                    ? Timestamp._fromProtobuf(
                          /** @type {proto.ITimestamp} */ (info.expiry)
                      )
                    : null,
            tokenMemo: info.memo != null ? info.memo : "",
            customFees:
                info.customFees != null
                    ? info.customFees.map((fee) => {
                          if (fee.fixedFee != null) {
                              return CustomFixedFee._fromProtobuf(fee);
                          } else if (fee.fractionalFee != null) {
                              return CustomFractionalFee._fromProtobuf(fee);
                          } else {
                              return CustomRoyaltyFee._fromProtobuf(fee);
                          }
                      })
                    : [],
            tokenType:
                info.tokenType != null
                    ? TokenType._fromCode(info.tokenType)
                    : null,
            supplyType:
                info.supplyType != null
                    ? TokenSupplyType._fromCode(info.supplyType)
                    : null,
            maxSupply: info.maxSupply != null ? info.maxSupply : null,
        });
    }

    /**
     * @returns {proto.ITokenInfo}
     */
    _toProtobuf() {
        return {
            tokenId: this.tokenId._toProtobuf(),
            name: this.name,
            symbol: this.symbol,
            decimals: this.decimals,
            totalSupply: this.totalSupply,
            treasury:
                this.treasuryAccountId != null
                    ? this.treasuryAccountId._toProtobuf()
                    : null,
            adminKey:
                this.adminKey != null ? keyToProtobuf(this.adminKey) : null,
            kycKey: this.kycKey != null ? keyToProtobuf(this.kycKey) : null,
            freezeKey:
                this.freezeKey != null ? keyToProtobuf(this.freezeKey) : null,
            wipeKey: this.wipeKey != null ? keyToProtobuf(this.wipeKey) : null,
            supplyKey:
                this.supplyKey != null ? keyToProtobuf(this.supplyKey) : null,
            feeScheduleKey:
                this.feeScheduleKey != null
                    ? keyToProtobuf(this.feeScheduleKey)
                    : null,
            defaultFreezeStatus:
                this.defaultFreezeStatus == null
                    ? 0
                    : this.defaultFreezeStatus
                    ? 1
                    : 2,
            defaultKycStatus:
                this.defaultKycStatus == null
                    ? 0
                    : this.defaultKycStatus
                    ? 1
                    : 2,
            deleted: this.isDeleted,
            autoRenewAccount:
                this.autoRenewAccountId != null
                    ? this.autoRenewAccountId._toProtobuf()
                    : undefined,
            autoRenewPeriod:
                this.autoRenewPeriod != null
                    ? this.autoRenewPeriod._toProtobuf()
                    : null,
            expiry:
                this.expirationTime != null
                    ? this.expirationTime._toProtobuf()
                    : null,
            memo: this.tokenMemo,
            customFees: this.customFees.map((fee) => fee._toProtobuf()),
            tokenType: this.tokenType != null ? this.tokenType._code : null,
            supplyType: this.supplyType != null ? this.supplyType._code : null,
            maxSupply: this.maxSupply,
        };
    }

    /**
     * @param {Uint8Array} bytes
     * @returns {TokenInfo}
     */
    static fromBytes(bytes) {
        return TokenInfo._fromProtobuf(proto.TokenInfo.decode(bytes));
    }

    /**
     * @returns {Uint8Array}
     */
    toBytes() {
        return proto.TokenInfo.encode(this._toProtobuf()).finish();
    }
}
