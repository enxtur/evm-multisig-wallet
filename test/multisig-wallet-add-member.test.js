const MultisigWallet = artifacts.require("MultisigWallet");

contract("MultisigWallet Add Member", function (accounts) {
  let instance;
  let proposal;
  it("should deploy multisig wallet", async function () {
    instance = await MultisigWallet.deployed();
    assert.ok(instance, "instance should be defined");
  });

  it("should submit add member proposal", async function () {
    const newMember = accounts[4];
    await instance.submitAddMemberProposal(newMember, { from: accounts[0] });
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
  it("should have 4 members", async function () {
    const memberCount = (await instance.getMemberCount()).toNumber();
    assert.equal(4, memberCount, "member count should be 4");
  });
});