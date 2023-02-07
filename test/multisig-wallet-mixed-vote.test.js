const MultisigWallet = artifacts.require("MultisigWallet");

contract("MultisigWallet Mixed Vote", function (accounts) {
  let instance;
  let proposal;
  it("should deploy multisig wallet", async function () {
    instance = await MultisigWallet.deployed();
    assert.ok(instance, "instance should be defined");
  });
  it("should submit some proposal", async function () {
    const newHotWallet = accounts[9];
    await instance.submitHotWalletProposal(newHotWallet, { from: accounts[0] });
  });
  it("should have 1 active proposal", async function () {
    let activeProposals = await instance.getActiveProposals(0, 1);
    proposal = activeProposals[0];
  });
  it("should have 1 accept, 2 rejects", async function () {
    await instance.reject(proposal.id, { from: accounts[1] });
    await instance.accept(proposal.id, { from: accounts[2] });
    await instance.reject(proposal.id, { from: accounts[3] });
  });
  it("should have rejected status", async function () {
    activeProposals = await instance.getActiveProposals(0, 1);
    assert.equal(0, activeProposals.length, "active proposals should have 0 proposal");

    const rejectedProposals = await instance.getRejectedProposals(0, 1);
    assert.equal(1, rejectedProposals.length, "rejected proposals should have 1 proposal");
    const [rejectedProposal] = rejectedProposals;
    assert.equal(rejectedProposal.id, proposal.id, "id should be " + proposal.id);
  });
  it("should remain same members", async function () {
    const memberCount = (await instance.getMemberCount()).toNumber();
    assert.equal(3, memberCount, "member count should be 3");
  });
});