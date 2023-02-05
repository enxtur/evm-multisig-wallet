const MultisigWallet = artifacts.require("MultisigWallet");

let members = ["0x29fa1BCB4B73CA4F6A01b882303C1210256C2A9B"]

module.exports = function(deployer, network, accounts) {
  if (network === "test") {
    const [caller, member1, member2, member3] = accounts;
    members = [member1, member2, member3];
    console.log("caller: ", caller);
    console.log("members: ", members);
    console.log("network: ", network);
    console.log("network: ", deployer);
  }
  deployer.deploy(MultisigWallet, members);
};