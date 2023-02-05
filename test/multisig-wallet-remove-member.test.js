const MultisigWallet = artifacts.require("MultisigWallet");

contract("MultisigWallet Remove Member", function (accounts) {
  let instance;
  let proposal;
  it("should deploy multisig wallet", async function () {
    instance = await MultisigWallet.deployed();
    assert.ok(instance, "instance should be defined");
  });
  it("should submit remove member proposal", async function () {
    const existingMember = accounts[3];
    await instance.submitRemoveMemberProposal(existingMember, { from: accounts[0] });
  });
  it("should have 1 active proposal", async function () {
    let activeProposals = await instance.getActiveProposals();
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
  it("should have 2 members", async function () {
    const memberCount = (await instance.getMemberCount()).toNumber();
    assert.equal(2, memberCount, "member count should be 2");
  });
});