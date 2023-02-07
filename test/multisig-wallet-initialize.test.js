const MultisigWallet = artifacts.require("MultisigWallet");

contract("MultisigWallet Initialize", function (accounts) {
  it("should initialize", async function () {
    const instance = await MultisigWallet.deployed();
    const expectedMemberCount = 3;
    const actualMemberCount = (await instance.getMemberCount()).toNumber();
    assert.equal(expectedMemberCount, actualMemberCount, "member count should be " + expectedMemberCount);

    const expectedActiveProposalCount = 0;
    const activeProposals = await instance.getActiveProposals(0, 1);
    assert.equal(expectedActiveProposalCount, activeProposals.length, "active proposals should be " + expectedActiveProposalCount);

    const expectedMinVotes = 2;
    const actualMinVotes = (await instance.getMinVotes()).toNumber();
    assert.equal(expectedMinVotes, actualMinVotes, "min votes should be " + expectedMinVotes);

    const expectedHotWallet = accounts[0];
    const actualHotWallet = await instance.getHotWallet();
    assert.equal(expectedHotWallet, actualHotWallet, "hot wallet should be " + expectedHotWallet);
  });
});