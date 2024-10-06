# Multisig-Wallet-Programs# Multisig Wallet on Solana

This project implements a Multisig Wallet on Solana using the Anchor framework. A multisig wallet requires multiple signatures from predefined owners to approve and execute transactions, providing an additional layer of security.

## Table of Contents
1. [Why PDAs (Program Derived Addresses)?](#why-pdas-program-derived-addresses)
2. [Key Functions Explained](#key-functions-explained)
   - [Initialize Multisig](#initialize-multisig)
   - [Create Transaction](#create-transaction)
   - [Approve Transaction](#approve-transaction)
   - [Revoke Transaction](#revoke-transaction)
   - [Fund Multisig](#fund-multisig)
   - 
---

## Why PDAs (Program Derived Addresses)?

A **PDA (Program Derived Address)** is used for creating a unique address that is controlled by the program and not associated with any private key. In the context of this multisig wallet:
- **Security**: PDAs ensure that only the program has control over the wallet's transactions, preventing unauthorized access or manipulation.
- **Uniqueness**: The PDA is derived using the hashed list of all owner public keys, ensuring a unique address for each multisig wallet based on its owners.
- **Determinism**: PDAs are deterministic, meaning the same input (owners list) will always produce the same PDA, ensuring a consistent wallet address.

The multisig wallet PDA is created using:
```rust
#[account(
    init,
    payer = signer, 
    space = ...,
    seeds = [&hash_owners_pubkey(&owners)],  
    bump
)]
pub multisig_wallet: Account<'info, MultisigWallet>,
```

## Key Functions Explained:
```rust
pub fn initialize_multisig(ctx: Context<InitializeMultisig>, name: String, owners: Vec<Pubkey>, threshold: u8) -> Result<()>
```
- This function initializes a new multisig wallet

```rust
pub fn create_transaction(ctx: Context<CreateTransaction>, amount: u64, recipient: Pubkey) -> Result<()>
```
-This function allows an owner to create a transaction

```rust
pub fn approve_transaction(ctx: Context<SignTransaction>, id: u32) -> Result<()>
```
-Allows an owner to approve a transaction and executes the transaction if the desired threshold is reached

```rust
pub fn revoke_transaction(ctx: Context<SignTransaction>, id: u32) -> Result<()>
```
-Allows an owner to revoke their approval of a transaction

``` rust
pub fn fund_multisig(ctx: Context<FundMultisig>, amount: u64) -> Result<()>
```
-Allows any signer to transfer SOL into the multisig wallet





