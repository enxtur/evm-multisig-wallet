const MultisigWallet = artifacts.require("MultisigWallet");

let members = [
  "0x29fa1BCB4B73CA4F6A01b882303C1210256C2A9B", // enxtur
  "0x6865fB489b645Cc703B5ab3552a3B55149E4F92B", // bilgee 1
  "0x5d8a68e8c2321Ec1DB810aB666c6DFf55107C030", // bilgee 2
]

module.exports = function(deployer, network, accounts) {
  if (network === "test") {
    const [caller, member1, member2, member3] = accounts;
    members = [member1, member2, member3];
    console.log("caller: ", caller);
    console.log("members: ", members);
    console.log("network: ", network);
  }
  deployer.deploy(MultisigWallet, members);
};