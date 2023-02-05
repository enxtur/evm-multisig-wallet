const MultisigWallet = artifacts.require("MultisigWallet");
const ERC20PresetFixedSupply = artifacts.require("ERC20PresetFixedSupply");

const ethAddress = "0x0000000000000000000000000000000000000000";

contract("MultisigWallet Transfer ETH", function (accounts) {
  let instance;
  let proposal;

  it("deploy instance", async function () {
    instance = await MultisigWallet.deployed();
  });

  it("should receive 1 eth", async function () {
    await instance.sendTransaction({ from: accounts[0], value: 1 });
    const balance = await web3.eth.getBalance(instance.address);
    assert.equal(balance, 1, "accounts[0] balance should be 1");
  });

  it("should submit transfer proposal", async function () {
    await instance.submitTransferProposal(ethAddress, 1, { from: accounts[0] });
  });

  it("should have 1 active proposal", async function () {
    let activeProposals = await instance.getActiveProposals();
    assert.equal(1, activeProposals.length, "active proposals should have 1 proposal");
    proposal = activeProposals[0];
  });

  it("should execute when 2 of 3 member accepts", async function () {
    await instance.accept(proposal.id, { from: accounts[1] });
    await instance.accept(proposal.id, { from: accounts[2] });
  });

  it("should have executed status", async function () {
    activeProposals = await instance.getActiveProposals();
    assert.equal(0, activeProposals.length, "active proposals should have 0 proposal");

    const executedProposals = await instance.getExecutedProposals();
    assert.equal(1, executedProposals.length, "executed proposals should have 1 proposal");
    const [executedProposal] = executedProposals;
    assert.equal(executedProposal.id, proposal.id, "id should be " + proposal.id);
  });

  it("should have 0 balance", async function () {
    const balance = await web3.eth.getBalance(instance.address);
    assert.equal(balance, 0, "balance should be 0");
  });
});