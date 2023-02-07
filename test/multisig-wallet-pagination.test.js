const MultisigWallet = artifacts.require("MultisigWallet");

contract("MultisigWallet Stress", function (accounts) {
  let instance;
  let proposal;
  it("should deploy multisig wallet", async function () {
    instance = await MultisigWallet.deployed();
    assert.ok(instance, "instance should be defined");
  });
  it("should submit some proposal", async function () {
    const newHotWallet = accounts[9];
    for (let i = 0; i < 95; i++) {
      if ((i+1) % 10 === 0) {
        console.log("    ✔ submitted", i+1, "proposals");
      }
      await instance.submitHotWalletProposal(newHotWallet, { from: accounts[0] });
    }
    assert.ok(true, "can submit 1000 proposals");
  });
  it("should get list by page with 10 items", async function () {
    let result = []
    for (let i = 0; i < 9; i++) {
      const proposals = await instance.getActiveProposals(i * 10, 10);
      assert.equal(10, proposals.length, "active proposals should have 10 proposals");
      result = [...result, ...proposals.map(p=>p.id)]
    }
    const proposals = await instance.getActiveProposals(90, 10);
    assert.equal(5, proposals.length, "active proposals should have 5 proposals");
    result = [...result, ...proposals.map(p=>p.id)]
    // result has unique ids
    const unique = [...new Set(result)];
    assert.equal(unique.length, 95, "active proposals should have 95 unique proposals");
  });
  // it("should have 1 accept, 2 rejects", async function () {
  //   await instance.reject(proposal.id, { from: accounts[1] });
  //   await instance.accept(proposal.id, { from: accounts[2] });
  //   await instance.reject(proposal.id, { from: accounts[3] });
  // });
  // it("should have rejected status", async function () {
  //   activeProposals = await instance.getActiveProposals(0, 1);
  //   assert.equal(0, activeProposals.length, "active proposals should have 0 proposal");

  //   const rejectedProposals = await instance.getRejectedProposals(0, 1);
  //   assert.equal(1, rejectedProposals.length, "rejected proposals should have 1 proposal");
  //   const [rejectedProposal] = rejectedProposals;
  //   assert.equal(rejectedProposal.id, proposal.id, "id should be " + proposal.id);
  // });
  // it("should remain same members", async function () {
  //   const memberCount = (await instance.getMemberCount()).toNumber();
  //   assert.equal(3, memberCount, "member count should be 3");
  // });
});