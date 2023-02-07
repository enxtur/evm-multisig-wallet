const MultisigWallet = artifacts.require("MultisigWallet");
const ERC20PresetFixedSupply = artifacts.require("ERC20PresetFixedSupply");

contract("MultisigWallet Transfer ERC 20 Token", function (accounts) {
  let erc20;
  let instance;
  let proposal;

  it("deploy instance & create new ERC 20 token", async function () {
    erc20 = await ERC20PresetFixedSupply.new("Test", "COIN", 10, accounts[0]);
    instance = await MultisigWallet.deployed();
  });

  it("should receive 1 test token", async function () {
    await erc20.transfer(instance.address, 1, { from: accounts[0] });
    const balance = (await erc20.balanceOf(instance.address)).toNumber();
    assert.equal(balance, 1, "accounts[0] balance should be 1");
  });

  it("should submit transfer proposal", async function () {
    await instance.submitTransferProposal(erc20.address, 1, { from: accounts[0] });
  });

  it("should have 1 active proposal", async function () {
    let activeProposals = await instance.getActiveProposals(0, 1);
    assert.equal(1, activeProposals.length, "active proposals should have 1 proposal");
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

  it("should have 0 balance", async function () {
    const balance = (await erc20.balanceOf(instance.address)).toNumber();
    assert.equal(balance, 0, "accounts[0] balance should be 0");
  });

  it("should have 10 balance in accounts[0]", async function () {
    const balance = (await erc20.balanceOf(accounts[0])).toNumber();
    assert.equal(balance, 10, "accounts[0] balance should be 1");
  })
});