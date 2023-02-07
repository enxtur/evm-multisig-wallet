// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetFixedSupply.sol"; // for testing with mock erc20 token
/// @custom:security-contact security@herox.mn
contract MultisigWallet is AccessControl {

	event EthDeposited(address indexed from, uint256 amount);
	event TransferProposalSubmitted(uint256 indexed id, address indexed token, uint256 amount);
	event HotWalletProposalSubmitted(uint256 indexed id, address indexed wallet);
	event MemberProposalSubmitted(uint256 indexed id, address indexed member, bool add);
	event ProposalVoted(uint256 indexed id, address indexed voter, bool vote);
	event ProposalExecuted(uint256 indexed id);
	event ProposalRejected(uint256 indexed id);
	

	bytes32 public constant MEMBER_ROLE = keccak256("MEMBER_ROLE");

	uint8 public MIN_VOTES = 100;

	uint8 public MEMBER_COUNT = 0;

	enum ProposalType {
		TRANSFER,
		HOT_WALLET,
		ADD_MEMBER,
		REMOVE_MEMBER
	}

	enum ProposalStatus {
		ACTIVE,
		EXECUTED,
		REJECTED
	}

	struct TransferProps {
		address token;
		uint256 amount;
	}

	struct HotWalletProps {
		address wallet;
	}

	struct MemberProps {
		address member;
	}

	struct Proposal {
		uint256 id;
		ProposalType proposalType;
		ProposalStatus status;

		uint8 minVotes;

		address[] accepts;
		address[] rejects;

		TransferProps transferProps;
		HotWalletProps hotWalletProps;
		MemberProps memberProps;

		uint256 timestamp;
	}

	Proposal[] private proposals;

	struct Vote {
		mapping(address => bool) votes;
	}
	
	mapping(uint256 => Vote) private votes;

	address HOT_WALLET;

	uint256 PROPOSAL_ID = 0;

	TransferProps NULL_TRANSFER_PROPS = TransferProps(address(0), 0);
	HotWalletProps NULL_HOT_WALLET_PROPS = HotWalletProps(address(0));
	MemberProps NULL_MEMBER_PROPS = MemberProps(address(0));

	constructor(address[] memory members) {
		_grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
		_updateHotWallet(HotWalletProps(_msgSender()));
		for (uint8 i = 0; i < members.length; i++) {
			_addMember(MemberProps(members[i]));
		}
	}

	function submitTransferProposal(address token, uint256 amount) public onlyRole(DEFAULT_ADMIN_ROLE) {
		uint256 id = PROPOSAL_ID++;

		proposals.push(Proposal(
			id,
			ProposalType.TRANSFER,
			ProposalStatus.ACTIVE,
			MIN_VOTES,
			new address[](0),
			new address[](0),
			TransferProps(token, amount),
			NULL_HOT_WALLET_PROPS,
			NULL_MEMBER_PROPS,
			block.timestamp
		));

		emit TransferProposalSubmitted(id, token, amount);
	}

	function submitHotWalletProposal(address newWallet) public onlyRole(DEFAULT_ADMIN_ROLE) {
		uint256 id = PROPOSAL_ID++;

		proposals.push(Proposal(
			id,
			ProposalType.HOT_WALLET,
			ProposalStatus.ACTIVE,
			MIN_VOTES,
			new address[](0),
			new address[](0),
			NULL_TRANSFER_PROPS,
			HotWalletProps(newWallet),
			NULL_MEMBER_PROPS,
			block.timestamp
		));

		emit HotWalletProposalSubmitted(id, newWallet);
	}

	function submitAddMemberProposal(address member) public onlyRole(DEFAULT_ADMIN_ROLE) {
		uint256 id = PROPOSAL_ID++;

		proposals.push(Proposal(
			id, 
			ProposalType.ADD_MEMBER, 
			ProposalStatus.ACTIVE, 
			MIN_VOTES, 
			new address[](0), 
			new address[](0),
			NULL_TRANSFER_PROPS, 
			NULL_HOT_WALLET_PROPS, 
			MemberProps(member),
			block.timestamp
		));

		emit MemberProposalSubmitted(id, member, true);
	}

	function submitRemoveMemberProposal(address member) public onlyRole(DEFAULT_ADMIN_ROLE) {
		uint256 id = PROPOSAL_ID++;

		proposals.push(Proposal(
			id, 
			ProposalType.REMOVE_MEMBER, 
			ProposalStatus.ACTIVE, 
			MIN_VOTES, 
			new address[](0), 
			new address[](0),
			NULL_TRANSFER_PROPS, 
			NULL_HOT_WALLET_PROPS, 
			MemberProps(member),
			block.timestamp
		));

		emit MemberProposalSubmitted(id, member, false);
	}

	function findActiveProposal(uint256 id) private view returns (uint256) {
		for (uint256 i = 0; i < proposals.length; i++) {
			if (proposals[i].id == id) {
				return i;
			}
		}
		revert("Proposal not found");
	}

	function accept(uint256 id) public onlyRole(MEMBER_ROLE) {
		Proposal storage proposal = proposals[findActiveProposal(id)];

		if (votes[id].votes[_msgSender()]) {
			revert("Already voted");
		}

		votes[id].votes[_msgSender()] = true;

		proposal.accepts.push(_msgSender());

		emit ProposalVoted(id, _msgSender(), true);

		if (proposal.accepts.length >= proposal.minVotes) {
			execute(proposal);
			proposal.status = ProposalStatus.EXECUTED;
			emit ProposalExecuted(proposal.id);
		}
	}

	function execute(Proposal storage proposal) private {
		if (proposal.proposalType == ProposalType.TRANSFER) {
			_transfer(proposal.transferProps);
		} else if (proposal.proposalType == ProposalType.HOT_WALLET) {
			_updateHotWallet(proposal.hotWalletProps);
		} else if (proposal.proposalType == ProposalType.ADD_MEMBER) {
			_addMember(proposal.memberProps);
		} else if (proposal.proposalType == ProposalType.REMOVE_MEMBER) {
			_removeMember(proposal.memberProps);
		} else {
			revert("Invalid proposal type");
		}
	}

	function reject(uint256 id) public onlyRole(MEMBER_ROLE) {
		Proposal storage proposal = proposals[findActiveProposal(id)];
		
		if (votes[id].votes[_msgSender()]) {
			revert("Already voted");
		}

		votes[id].votes[_msgSender()] = true;

		proposal.rejects.push(_msgSender());

		emit ProposalVoted(id, _msgSender(), false);

		if (proposal.rejects.length >= proposal.minVotes) {
			proposal.status = ProposalStatus.REJECTED;
			emit ProposalRejected(proposal.id);
		}
	}

	function getProposalCount (ProposalStatus status) public view returns (uint256) {
		uint256 activeProposalCount = 0;
		for (uint256 i = 0; i < proposals.length; i++) {
			if (proposals[i].status == status) {
				activeProposalCount++;
			}
		}
		return activeProposalCount;
	}
	
	function _getProposals(ProposalStatus status) private view returns (Proposal[] memory) {
		uint256 proposalCount = getProposalCount(status);
		Proposal[] memory resultProposals = new Proposal[](proposalCount);
		uint256 resultIndex = 0;
		for (uint256 i = proposals.length; i >= 1; i--) {
			if (proposals[i - 1].status == status) {
				resultProposals[resultIndex] = proposals[i - 1];
				resultIndex++;
			}
		}
		return resultProposals;
	}

	function getActiveProposals() public view returns (Proposal[] memory) {
		return _getProposals(ProposalStatus.ACTIVE);
	}

	function getExecutedProposals() public view returns (Proposal[] memory) {
		return _getProposals(ProposalStatus.EXECUTED);
	}

	function getRejectedProposals() public view returns (Proposal[] memory) {
		return _getProposals(ProposalStatus.REJECTED);
	}

	function getHotWallet() public view returns (address) {
		return HOT_WALLET;
	}

	function getMemberCount() public view returns (uint8) {
		return MEMBER_COUNT;
	}

	function getMinVotes() public view returns (uint8) {
		return MIN_VOTES;
	}

	function getProposalID() public view returns (uint256) {
		return PROPOSAL_ID;
	}

	receive() external payable {}

	fallback() external payable {}


	function _addMember(MemberProps memory props) private {
		_grantRole(MEMBER_ROLE, props.member);
		MEMBER_COUNT++;
		MIN_VOTES = MEMBER_COUNT / 2 + 1;
	}

	function _removeMember(MemberProps memory props) private {
		_revokeRole(MEMBER_ROLE, props.member);
		MEMBER_COUNT--;
		MIN_VOTES = MEMBER_COUNT / 2 + 1;
	}

	function _transfer(TransferProps memory props) private {
		if (props.token == address(0)) {
			payable(HOT_WALLET).transfer(props.amount);
		} else {
			ERC20(props.token).transfer(HOT_WALLET, props.amount);
		}
	}

	function _updateHotWallet(HotWalletProps memory props) private {
		HOT_WALLET = props.wallet;
	}
}