const MultisigWallet = artifacts.require("MultisigWallet");

contract("MultisigWallet Submit Proposals", function (accounts) {
  let instance;
  it("should deploy multisig wallet", async function () {
    instance = await MultisigWallet.deployed();
    assert.ok(instance, "instance should be defined");
  });
  it("should submit add member proposal", async function () {
    const newMember = accounts[4];
    await instance.submitAddMemberProposal(newMember, { from: accounts[0] });

    const activeProposals = await instance.getActiveProposals(0, 10);
    assert.equal(1, activeProposals.length, "active proposals should have 1 proposal");

    const proposal = activeProposals[0];
    assert.equal(proposal.id, "0", "id should be 0");
    assert.equal(proposal.proposalType, "2", "proposalType should be 2");
    assert.equal(proposal.minVotes, "2", "minVotes should be 2");
    assert.equal(proposal.accepts.length, 0, "accepts should be empty");
    assert.equal(proposal.rejects.length, 0, "rejects should be empty");
    assert.equal(proposal.memberProps.member, newMember, "member should be " + newMember);
  });
  it("should submit remove member proposal", async function () {
    const existingMember = accounts[3];
    await instance.submitRemoveMemberProposal(existingMember, { from: accounts[0] });

    const activeProposals = await instance.getActiveProposals(0, 10);
    assert.equal(activeProposals.length, 2, "active proposals should have 2 proposal");

    const proposal = activeProposals[0];
    assert.equal(proposal.id, "1", "id should be 1");
    assert.equal(proposal.proposalType, "3", "proposalType should be 3");
    assert.equal(proposal.minVotes, "2", "minVotes should be 2");
    assert.equal(proposal.accepts.length, 0, "accepts should be empty");
    assert.equal(proposal.rejects.length, 0, "rejects should be empty");
    assert.equal(proposal.memberProps.member, existingMember, "member should be " + existingMember);
  });
  it("should submit hot wallet proposal", async function () {
    const newHotWallet = accounts[9];
    await instance.submitHotWalletProposal(newHotWallet, { from: accounts[0] });

    const activeProposals = await instance.getActiveProposals(0, 10);
    assert.equal(activeProposals.length, 3, "active proposals should have 3 proposal");

    const proposal = activeProposals[0];
    assert.equal(proposal.id, "2", "id should be 2");
    assert.equal(proposal.proposalType, "1", "proposalType should be 1");
    assert.equal(proposal.minVotes, "2", "minVotes should be 2");
    assert.equal(proposal.accepts.length, 0, "accepts should be empty");
    assert.equal(proposal.rejects.length, 0, "rejects should be empty");
    assert.equal(proposal.hotWalletProps.wallet, newHotWallet, "member should be " + newHotWallet);
  });
  it("should submit transfer proposal", async function () {
    const fakeTokenAddress = accounts[9];
    const amount = '1';
    await instance.submitTransferProposal(fakeTokenAddress, amount, { from: accounts[0] });

    const activeProposals = await instance.getActiveProposals(0, 10);
    assert.equal(activeProposals.length, 4, "active proposals should have 4 proposal");

    const proposal = activeProposals[0];
    assert.equal(proposal.id, "3", "id should be 3");
    assert.equal(proposal.proposalType, "0", "proposalType should be 0");
    assert.equal(proposal.minVotes, "2", "minVotes should be 2");
    assert.equal(proposal.accepts.length, 0, "accepts should be empty");
    assert.equal(proposal.rejects.length, 0, "rejects should be empty");
    assert.equal(proposal.transferProps.token, fakeTokenAddress, "token should be " + fakeTokenAddress);
    assert.equal(proposal.transferProps.amount, amount, "amount should be " + amount);
  });
});