const MultisigWallet = artifacts.require("MultisigWallet");

contract("MultisigWallet Duplicate Vote", function (accounts) {
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
    let activeProposals = await instance.getActiveProposals();
    proposal = activeProposals[0];
  });
  it("should not vote multiple", async function () {
    await instance.reject(proposal.id, { from: accounts[1] });
    try {
      await instance.accept(proposal.id, { from: accounts[1] });
      assert.fail("should throw error");
    } catch (e) {
      assert.ok(e, "should throw error");
    }
    try {
      await instance.reject(proposal.id, { from: accounts[1] });
      assert.fail("should throw error");
    } catch (e) {
      assert.ok(e, "should throw error");
    }

    await instance.accept(proposal.id, { from: accounts[2] });
    try {
      await instance.accept(proposal.id, { from: accounts[2] });
      assert.fail("should throw error");
    } catch (e) {
      assert.ok(e, "should throw error");
    }
    try {
      await instance.reject(proposal.id, { from: accounts[2] });
      assert.fail("should throw error");
    } catch (e) {
      assert.ok(e, "should throw error");
    }
  });
});