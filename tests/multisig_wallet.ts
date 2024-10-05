import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { MultisigWallet } from "../target/types/multisig_wallet";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL, Connection } from "@solana/web3.js";
import * as crypto from "crypto";
import BN from 'bn.js';


describe("multisig_wallet", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const conn = new Connection("http://127.0.0.1:8899", { commitment: "confirmed" });


  const program = anchor.workspace.MultisigWallet as Program<MultisigWallet>;

  const wallet = anchor.web3.Keypair.generate();
  const wallet1 = anchor.web3.Keypair.generate();
  const wallet2 = anchor.web3.Keypair.generate();

  console.log("owner: " + wallet.publicKey)
  console.log("owner: " + wallet1.publicKey)

  async function generatePda(owners: PublicKey[]): Promise<anchor.web3.PublicKey> {

    console.log("OWNERS: " + owners.toString())

    let hexString = crypto.createHash('sha256').update(owners.toString(), 'utf-8').digest('hex');

    let seed = Uint8Array.from(Buffer.from(hexString, 'hex'));

    console.log("HEX: " + hexString)
    console.log("Seed: " + seed)

    console.log(typeof (seed))

    console.log("Program id: " + program.programId)

    const [pdaWalletAddr,] = await anchor.web3.PublicKey.findProgramAddressSync([seed], program.programId);

    console.log(pdaWalletAddr)

    return pdaWalletAddr;
  }

  async function airdropLamports(signer: PublicKey, amount: number) {
    const signature = await program.provider.connection.requestAirdrop(signer, amount);

    const latestBlockHash = await program.provider.connection.getLatestBlockhash();

    await program.provider.connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: signature,
    })
  }


  it("Is initialized!", async () => {
    await airdropLamports(wallet.publicKey, 1000 * LAMPORTS_PER_SOL);
    await airdropLamports(wallet1.publicKey, 1000 * LAMPORTS_PER_SOL);
    await airdropLamports(wallet2.publicKey, 1000 * LAMPORTS_PER_SOL);

    const pda = await generatePda([wallet.publicKey, wallet1.publicKey, wallet2.publicKey])

    await airdropLamports(pda, 1000 * LAMPORTS_PER_SOL);
    await airdropLamports(new PublicKey("77c1d9QqZURkgYE85cjeBCxTqRy9aMWUz8svHNPuZg7S"), 1000 * LAMPORTS_PER_SOL);
    console.log("PDA: " + pda)
    console.log(await conn.getBalance(wallet.publicKey))

    const tx = await program.methods
      .initializeMultisig("AAAAAAAAAAAAAAAAAAAAAAAAA", [wallet.publicKey, wallet1.publicKey, wallet2.publicKey], 3)
      .accountsStrict({
        multisigWallet: await generatePda([wallet.publicKey, wallet1.publicKey, wallet2.publicKey]),
        signer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([wallet])
      .rpc();
    console.log("INITIALIZATION: ", tx);

  //   const tx4 = await program.methods
  //   .fundMultisig(new BN(5000000000))
  //   .accountsStrict({
  //     multisigWallet: await generatePda([wallet.publicKey, wallet1.publicKey, wallet2.publicKey]),
  //     signer: wallet.publicKey,
  //     systemProgram: SystemProgram.programId
  //   })
  //   .signers([wallet])
  //   .rpc();
  // console.log("FUND: ", tx4);


  console.log(await conn.getBalance(wallet.publicKey))


    const tx1 = await program.methods
      .createTransaction(new BN(5000000000), new PublicKey("54UeDnEea7adNwWqRqkmbHTGNHzpKJWTCJN1X69PJiex"))
      .accountsStrict({
        multisigWallet: await generatePda([wallet.publicKey, wallet1.publicKey, wallet2.publicKey]),
        signer: wallet.publicKey,
        systemProgram: SystemProgram.programId
      })
      .signers([wallet])
      .rpc();
    console.log("TRANSACTION CREATION: ", tx1);

    // const multisig = await program.account.multisigWallet.fetch(
    //   new PublicKey("7QAMvcwLtvLu2JamWVgqCS8xCXSuFuK4YHgu6Porjcf4")
    // );

    // console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaaaa")
    // console.log(multisig)
    // console.log(multisig.txs)

    const tx2 = await program.methods
    .approveTransaction(1)
    .accountsStrict({
      multisigWallet: await generatePda([wallet.publicKey, wallet1.publicKey, wallet2.publicKey]),
      recipient: new PublicKey("54UeDnEea7adNwWqRqkmbHTGNHzpKJWTCJN1X69PJiex"),
      signer: wallet1.publicKey,
    })
    .signers([wallet1])
    .rpc();
    console.log("APPROVE 2: ", tx1);

    const tx5 = await program.methods
    .revokeTransaction(1)
    .accountsStrict({
      multisigWallet: await generatePda([wallet.publicKey, wallet1.publicKey, wallet2.publicKey]),
      recipient: new PublicKey("54UeDnEea7adNwWqRqkmbHTGNHzpKJWTCJN1X69PJiex"),
      signer: wallet1.publicKey,
    })
    .signers([wallet1])
    .rpc();
    console.log("REVOKE 2: ", tx5);



    // const tx3 = await program.methods
    // .executeTransaction(1)
    // .accountsStrict({
    //   multisigWallet: await generatePda([wallet.publicKey, wallet1.publicKey]),
    //   recipient: new PublicKey("54UeDnEea7adNwWqRqkmbHTGNHzpKJWTCJN1X69PJiex"),
    //   signer: wallet.publicKey,
    // })
    // .signers([wallet])
    // .rpc();
    // console.log("Transfer ", tx3);
  });

  // it("Transaction created!", async () => {
  //   await airdropLamports(payer.publicKey, 1000 * LAMPORTS_PER_SOL);
  //   const tx = await program.methods
  //     .createTransaction()
  //     .accountsStrict({
  //       multisigWallet: await generatePda([wallet.publicKey, wallet.publicKey, wallet1.publicKey]),
  //       signer: payer.publicKey,
  //       systemProgram: SystemProgram.programId,
  //     })
  //     .signers([payer])
  //     .rpc();
  //   console.log("Your transaction signature", tx);
  // });
});
