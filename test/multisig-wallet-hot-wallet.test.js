const MultisigWallet = artifacts.require("MultisigWallet");

contract("MultisigWallet Hot Wallet", function (accounts) {
  let instance;
  let proposal;
  it("should deploy multisig wallet", async function () {
    instance = await MultisigWallet.deployed();
    assert.ok(instance, "instance should be defined");
  });
  it("should submit hot wallet proposal", async function () {
    const newHotWallet = accounts[9];
    await instance.submitHotWalletProposal(newHotWallet, { from: accounts[0] });
  });
  it("should have 1 active proposal", async function () {
    let activeProposals = await instance.getActiveProposals(0, 1);
    proposal = activeProposals[0];
  });
  it("should execute when 2 of 3 member accepts", async function () {
    await instance.accept(proposal.id, { from: accounts[1] });
    await instance.accept(proposal.id, { from: accounts[2] });
  });
  it("should have executed status", async function () {
    activeProposals = await instance.getActiveProposals(0, 1);
    assert.equal(0, activeProposals.length, "active proposals should have 0 proposal");

    const executedProposals = await instance.getExecutedProposals(0, 1);
    assert.equal(1, executedProposals.length, "executed proposals should have 1 proposal");
    const [executedProposal] = executedProposals;
    assert.equal(executedProposal.id, proposal.id, "id should be " + proposal.id);
  });
  it("should have new hot wallet", async function () {
    const hotWallet = await instance.getHotWallet();
    assert.equal(hotWallet, accounts[9], "hot wallet should be " + accounts[9]);
  });
});