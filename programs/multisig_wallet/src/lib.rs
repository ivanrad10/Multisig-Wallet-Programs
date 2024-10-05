use anchor_lang::prelude::*;
use solana_program::hash::hash;
use std::collections::HashSet;

const ANCHOR_DISCRIMINATOR: usize = 8;
const MAX_NAME_SIZE: usize = 32;
const PUBKEY_SIZE: usize = 32;
const EMPTY_VECTOR_SIZE: usize = 4;
const BOOL_SIZE: usize = 1;
const U8_SIZE: usize = 1;
const U32_SIZE: usize = 4;
const U64_SIZE: usize = 8;
const BASE_TRANSACTION_SIZE: usize = U32_SIZE + PUBKEY_SIZE + U64_SIZE + BOOL_SIZE + EMPTY_VECTOR_SIZE;
declare_id!("6FEYAgVEsTXQkcmyWANDo5azVHJk8e3n4GscJf5vaE9p");

#[program]
pub mod multisig_wallet {
    use super::*;

    pub fn initialize_multisig(         
        ctx: Context<InitializeMultisig>, 
        name: String,
        owners: Vec<Pubkey>,
        threshold: u8,
    ) -> Result<()> {
        assert_unique_owners(&owners)?;
        require!(owners.len() > 1, ErrorCode::InvalidNumberOfOwners);
        require!(threshold > 1 && threshold as usize <= owners.len(), ErrorCode::InvalidThreshold);

        let multisig_wallet = &mut ctx.accounts.multisig_wallet;
        multisig_wallet.name = name;
        multisig_wallet.owners = owners;
        multisig_wallet.threshold = threshold;
        multisig_wallet.txs = Vec::new();
        multisig_wallet.bump = ctx.bumps.multisig_wallet;

        emit!(MultisigCreatedEvent {});  

        Ok(())
    }

    pub fn create_transaction(ctx: Context<CreateTransaction>, amount: u64, recipient: Pubkey) -> Result<()> { 
        let multisig = &mut ctx.accounts.multisig_wallet;

        require!(
            multisig.owners.contains(&ctx.accounts.signer.key),
            ErrorCode::InvalidTxCreator
        );
        require!(
            **multisig
                .to_account_info()
                .lamports
                .borrow() > amount,
            ErrorCode::InsufficientBalance
        );
        require!(
            amount >= 1000,
            ErrorCode::InsufficentTransferAmount
        );

        let new_id = if let Some(last_transaction) = multisig.txs.last() {
            last_transaction.id + 1
        } else {
            1
        };

        let transaction: Transaction = Transaction {
            id: new_id,
            signers: vec![ctx.accounts.signer.key()],
            recipient,   
            amount,
            is_executed: false,
        };
        multisig.txs.push(transaction);
        emit!(TransactionCreatedEvent {});

        Ok(())
    }

    pub fn approve_transaction(ctx: Context<SignTransaction>, id: u32) -> Result<()> {
        let multisig = &mut ctx.accounts.multisig_wallet;
        let threshold = multisig.threshold;
        let pda_account = multisig.to_account_info();

        require!(
            multisig.owners.contains(&ctx.accounts.signer.key()),
            ErrorCode::InvalidTransactionSigner
        );

        let transaction = multisig
        .txs
        .iter_mut()
        .find(|tx| tx.id == id)
        .ok_or(ErrorCode::InvalidTransaction)?;
    
        require!(
            !transaction.signers.contains(&ctx.accounts.signer.key()),
            ErrorCode::TransactionAlreadySigned
        );

        require!(
            !transaction.is_executed,
            ErrorCode::TransactionAlreadyExecuted
        );

        require!(
            transaction.recipient == ctx.accounts.recipient.key(),
            ErrorCode::IvalidRecipient
        );

        transaction.signers.push(ctx.accounts.signer.key());
        emit!(TransactionApprovedEvent {});

        if transaction.signers.len() >= threshold as usize {
            let recipient_account = ctx.accounts.recipient.to_account_info();

            **pda_account.try_borrow_mut_lamports()? -= transaction.amount;
            **recipient_account.try_borrow_mut_lamports()? += transaction.amount;

            transaction.is_executed = true;
            emit!(TransactionExecutedEvent {});
        }
        
        Ok(())
    }

    pub fn revoke_transaction(ctx: Context<SignTransaction>, id: u32) -> Result<()> {
        let multisig = &mut ctx.accounts.multisig_wallet;
        let signer_key = ctx.accounts.signer.key();

        require!(
            multisig.owners.contains(&signer_key),
            ErrorCode::InvalidTransactionSigner
        );

        let transaction = multisig
        .txs
        .iter_mut()
        .find(|tx| tx.id == id)
        .ok_or(ErrorCode::InvalidTransaction)?;
    
        require!(
            !transaction.is_executed,
            ErrorCode::TransactionAlreadyExecuted
        );

        match transaction.signers.iter().position(|&signer| signer == signer_key) {
            Some(position) => {
                transaction.signers.remove(position);
                emit!(TransactionRevokedEvent {});
            },
            None => return Err(ErrorCode::SignerNotFound.into()),
        };
                
        Ok(())
    }

    pub fn fund_multisig(ctx: Context<FundMultisig>, amount: u64) -> Result<()> {
        let sender = &mut ctx.accounts.signer;
        let multisig_wallet = &mut ctx.accounts.multisig_wallet;

        require!(amount > 0, ErrorCode::InvalidFundingAmount);

        require!(
            sender.to_account_info().lamports() >= amount,
            ErrorCode::InsufficientBalance
        );

        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &sender.key(),
            &multisig_wallet.key(),
            amount,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                sender.to_account_info(),
                multisig_wallet.to_account_info(),
            ],
        )?;

        emit!(MultisigFundedEvent {});  

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name: String, owners: Vec<Pubkey>, threshold: u8)]
pub struct InitializeMultisig<'info> {
    #[account(
        init,
        payer = signer, 
        space = ANCHOR_DISCRIMINATOR + MAX_NAME_SIZE + U8_SIZE + U8_SIZE + EMPTY_VECTOR_SIZE + (owners.len() * PUBKEY_SIZE) + EMPTY_VECTOR_SIZE, 
        seeds = [&hash_owners_pubkey(&owners)],  
        bump
    )]
    pub multisig_wallet: Account<'info, MultisigWallet>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateTransaction<'info> {
    #[account(
        mut,
        seeds = [&hash_owners_pubkey(&multisig_wallet.owners)],
        bump = multisig_wallet.bump,
        realloc = multisig_wallet.get_size() + BASE_TRANSACTION_SIZE + (multisig_wallet.threshold * 32) as usize,
        realloc::payer = signer,
        realloc::zero = false,
    )]
    pub multisig_wallet: Account<'info, MultisigWallet>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SignTransaction<'info> {
    #[account(
        mut,
        seeds = [&hash_owners_pubkey(&multisig_wallet.owners)],
        bump = multisig_wallet.bump,)]
    pub multisig_wallet: Account<'info, MultisigWallet>,
    #[account(mut)]
    /// CHECK: only an address that is the recipient, no need for checking
    pub recipient: UncheckedAccount<'info>,
    #[account(mut)]
    pub signer: Signer<'info>,
}

#[derive(Accounts)]
pub struct FundMultisig<'info> {
    #[account(
        mut,
        seeds = [&hash_owners_pubkey(&multisig_wallet.owners)],
        bump = multisig_wallet.bump,)]
    pub multisig_wallet: Account<'info, MultisigWallet>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct MultisigWallet {
    pub name: String,
    pub threshold: u8,
    pub bump: u8,
    pub owners: Vec<Pubkey>,
    pub txs: Vec<Transaction>,
}

impl MultisigWallet {
    pub fn get_size(&self) -> usize {
        let mut size = ANCHOR_DISCRIMINATOR
            + MAX_NAME_SIZE 
            + U8_SIZE 
            + U8_SIZE
            + EMPTY_VECTOR_SIZE 
            + (self.owners.len() * PUBKEY_SIZE)
            + EMPTY_VECTOR_SIZE;
        
        for tx in &self.txs {
            size += tx.get_size(self.threshold as usize);
        }

        size
    }
}

#[derive(AnchorDeserialize, AnchorSerialize, Debug, Clone)]
pub struct Transaction {
    pub id: u32,
    pub recipient: Pubkey,
    pub amount: u64,
    pub is_executed: bool,
    pub signers: Vec<Pubkey>,
}

impl Transaction {
    pub fn get_size(&self, threshold: usize) -> usize {
        let size = U32_SIZE 
            + PUBKEY_SIZE 
            + U64_SIZE 
            + BOOL_SIZE 
            + EMPTY_VECTOR_SIZE 
            + (threshold * PUBKEY_SIZE);

        size
    }
}

#[event]
pub struct MultisigCreatedEvent {
}

#[event]
pub struct TransactionCreatedEvent {
}

#[event]
pub struct TransactionApprovedEvent {
}

#[event]
pub struct TransactionRevokedEvent {
}

#[event]
pub struct TransactionExecutedEvent {
}

#[event]
pub struct MultisigFundedEvent {
}

fn hash_owners_pubkey(owners: &Vec<Pubkey>) -> [u8; 32] {
    let owners_string: String = owners
        .iter()
        .map(|pubkey| pubkey.to_string())
        .collect::<Vec<String>>()
        .join(",");

    let hash_result = hash(owners_string.as_bytes());
    hash_result.to_bytes()
}

fn assert_unique_owners(owners: &[Pubkey]) -> Result<()> {
    let mut unique_owners = HashSet::new();

    for owner in owners {
        require!(unique_owners.insert(*owner), ErrorCode::UniqueOwners);
    }

    Ok(())
}

#[error_code]
pub enum ErrorCode {
    #[msg("Threshold must be less than or equal compared to number of owners!")]
    InvalidThreshold,
    #[msg("Owners must be unique!")]
    UniqueOwners,
    #[msg("There must be at lest one owner!")]
    InvalidNumberOfOwners,
    #[msg("Only the owner of the wallet can create the transaction!")]
    InvalidTxCreator,
    #[msg("You have provided an invalid tx id!")]
    InvalidTransaction,
    #[msg("Transaction already executed!")]
    TransactionAlreadyExecuted,
    #[msg("Invalid transaction signer!")]
    InvalidTransactionSigner,
    #[msg("Signer not found!")]
    SignerNotFound,
    #[msg("This owner already signed the transaction!")]
    TransactionAlreadySigned,
    #[msg("You dont have enough sol to initiate this transaction!")]
    InsufficientBalance,
    #[msg("You must send a minimum of 1000 lamports")]
    InsufficentTransferAmount,
    #[msg("There is not enough signers to execute this transaction!")]
    NoEnoughSigners,
    #[msg("You provided an invalid transation recipient!")]
    IvalidRecipient,
    #[msg("The funding amount must be greater than zero.")]
    InvalidFundingAmount,
}
