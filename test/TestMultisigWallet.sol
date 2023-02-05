// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "../contracts/MultisigWallet.sol";

contract TestMultisigWallet {

  function testInitialize() public {
    address[] memory members = new address[](0);
    MultisigWallet wallet = new MultisigWallet(members);
    assert(wallet.getHotWallet() == address(this));
    assert(wallet.getMemberCount() == 0);
  }

  function testSubmitTransfer() public {
    MultisigWallet wallet = new MultisigWallet(new address[](0));
    wallet.submitTransferProposal(address(1), 1);
    assert(true);
  }

  function testSubmitHotWallet() public {
    MultisigWallet wallet = new MultisigWallet(new address[](0));
    wallet.submitHotWalletProposal(address(1));
    assert(true);
  }

  function testSubmitAddMember() public {
    MultisigWallet wallet = new MultisigWallet(new address[](0));
    wallet.submitAddMemberProposal(address(1));
    assert(true);
  }

  function testSubmitRemoveMember() public {
    MultisigWallet wallet = new MultisigWallet(new address[](0));
    wallet.submitRemoveMemberProposal(address(1));
    assert(true);
  }

  function testAccept() public {
    MultisigWallet wallet = new MultisigWallet(new address[](0));
    wallet.submitTransferProposal(address(1), 1);

    MultisigWallet.Proposal[] memory proposals  = wallet.getActiveProposals();

    try wallet.accept(proposals[0].id) {
      assert(false);
    } catch {
      assert(true);
    }
  }

  function testReject() public {
    MultisigWallet wallet = new MultisigWallet(new address[](0));
    wallet.submitTransferProposal(address(1), 1);

    MultisigWallet.Proposal[] memory proposals  = wallet.getActiveProposals();

    try wallet.reject(proposals[0].id) {
      assert(false);
    } catch {
      assert(true);
    }
  }
}