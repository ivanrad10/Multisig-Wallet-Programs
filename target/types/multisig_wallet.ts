/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/multisig_wallet.json`.
 */
export type MultisigWallet = {
  "address": "6FEYAgVEsTXQkcmyWANDo5azVHJk8e3n4GscJf5vaE9p",
  "metadata": {
    "name": "multisigWallet",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "approveTransaction",
      "discriminator": [
        224,
        39,
        88,
        181,
        36,
        59,
        155,
        122
      ],
      "accounts": [
        {
          "name": "multisigWallet",
          "writable": true
        },
        {
          "name": "recipient",
          "writable": true
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "u32"
        }
      ]
    },
    {
      "name": "createTransaction",
      "discriminator": [
        227,
        193,
        53,
        239,
        55,
        126,
        112,
        105
      ],
      "accounts": [
        {
          "name": "multisigWallet",
          "writable": true
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "recipient",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "fundMultisig",
      "discriminator": [
        200,
        92,
        28,
        164,
        234,
        106,
        34,
        57
      ],
      "accounts": [
        {
          "name": "multisigWallet",
          "writable": true
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeMultisig",
      "discriminator": [
        220,
        130,
        117,
        21,
        27,
        227,
        78,
        213
      ],
      "accounts": [
        {
          "name": "multisigWallet",
          "writable": true
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "owners",
          "type": {
            "vec": "pubkey"
          }
        },
        {
          "name": "threshold",
          "type": "u8"
        }
      ]
    },
    {
      "name": "revokeTransaction",
      "discriminator": [
        151,
        11,
        167,
        79,
        194,
        68,
        187,
        45
      ],
      "accounts": [
        {
          "name": "multisigWallet",
          "writable": true
        },
        {
          "name": "recipient",
          "writable": true
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "u32"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "multisigWallet",
      "discriminator": [
        32,
        135,
        234,
        172,
        132,
        39,
        242,
        66
      ]
    }
  ],
  "events": [
    {
      "name": "multisigCreatedEvent",
      "discriminator": [
        98,
        203,
        248,
        192,
        188,
        46,
        210,
        62
      ]
    },
    {
      "name": "multisigFundedEvent",
      "discriminator": [
        234,
        73,
        12,
        44,
        254,
        175,
        82,
        13
      ]
    },
    {
      "name": "transactionApprovedEvent",
      "discriminator": [
        250,
        134,
        62,
        10,
        156,
        65,
        38,
        91
      ]
    },
    {
      "name": "transactionCreatedEvent",
      "discriminator": [
        73,
        168,
        186,
        170,
        201,
        92,
        219,
        87
      ]
    },
    {
      "name": "transactionExecutedEvent",
      "discriminator": [
        138,
        185,
        121,
        218,
        65,
        145,
        254,
        24
      ]
    },
    {
      "name": "transactionRevokedEvent",
      "discriminator": [
        11,
        41,
        255,
        53,
        170,
        118,
        85,
        177
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidThreshold",
      "msg": "Threshold must be less than or equal compared to number of owners!"
    },
    {
      "code": 6001,
      "name": "uniqueOwners",
      "msg": "Owners must be unique!"
    },
    {
      "code": 6002,
      "name": "invalidNumberOfOwners",
      "msg": "There must be at lest one owner!"
    },
    {
      "code": 6003,
      "name": "invalidTxCreator",
      "msg": "Only the owner of the wallet can create the transaction!"
    },
    {
      "code": 6004,
      "name": "invalidTransaction",
      "msg": "You have provided an invalid tx id!"
    },
    {
      "code": 6005,
      "name": "transactionAlreadyExecuted",
      "msg": "Transaction already executed!"
    },
    {
      "code": 6006,
      "name": "invalidTransactionSigner",
      "msg": "Invalid transaction signer!"
    },
    {
      "code": 6007,
      "name": "signerNotFound",
      "msg": "Signer not found!"
    },
    {
      "code": 6008,
      "name": "transactionAlreadySigned",
      "msg": "This owner already signed the transaction!"
    },
    {
      "code": 6009,
      "name": "insufficientBalance",
      "msg": "You dont have enough sol to initiate this transaction!"
    },
    {
      "code": 6010,
      "name": "insufficentTransferAmount",
      "msg": "You must send a minimum of 1000 lamports"
    },
    {
      "code": 6011,
      "name": "noEnoughSigners",
      "msg": "There is not enough signers to execute this transaction!"
    },
    {
      "code": 6012,
      "name": "ivalidRecipient",
      "msg": "You provided an invalid transation recipient!"
    },
    {
      "code": 6013,
      "name": "invalidFundingAmount",
      "msg": "The funding amount must be greater than zero."
    }
  ],
  "types": [
    {
      "name": "multisigCreatedEvent",
      "type": {
        "kind": "struct",
        "fields": []
      }
    },
    {
      "name": "multisigFundedEvent",
      "type": {
        "kind": "struct",
        "fields": []
      }
    },
    {
      "name": "multisigWallet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "threshold",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "owners",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "txs",
            "type": {
              "vec": {
                "defined": {
                  "name": "transaction"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "transaction",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u32"
          },
          {
            "name": "recipient",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "isExecuted",
            "type": "bool"
          },
          {
            "name": "signers",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "transactionApprovedEvent",
      "type": {
        "kind": "struct",
        "fields": []
      }
    },
    {
      "name": "transactionCreatedEvent",
      "type": {
        "kind": "struct",
        "fields": []
      }
    },
    {
      "name": "transactionExecutedEvent",
      "type": {
        "kind": "struct",
        "fields": []
      }
    },
    {
      "name": "transactionRevokedEvent",
      "type": {
        "kind": "struct",
        "fields": []
      }
    }
  ]
};
