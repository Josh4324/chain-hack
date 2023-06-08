//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Pay.sol";

contract Payment2 {
    Payment internal pay;

    uint256 splitCounter;
    uint256 escrowId;

    struct Split {
        string name;
        uint256 amount;
        uint256 amountReceivedByRecipient;
        address creator;
        address[] friends;
        string status;
        address recipient;
        uint256 splitId;
    }

    struct SplitStat {
        uint256 amount;
        address creator;
        address owner;
        string status;
        PaymentStatus request;
        uint256 splitId;
    }

    struct Escrow {
        string name;
        string desc;
        string img;
        uint256 amount;
        address buyer;
        address seller;
        string status;
        uint256 escrowId;
    }

    enum PaymentStatus {
        pending,
        accepted,
        rejected,
        paid
    }

    PaymentStatus public status;

    mapping(uint256 => Split) public SplitData;
    mapping(uint256 => mapping(address => SplitStat)) public SplitStats;
    mapping(uint256 => Escrow) public idToEscrow;

    event splitEvent(
        string name,
        uint256 amount,
        uint256 amountReceivedByRecipient,
        address creator,
        address[] friends,
        string status,
        address recipient,
        uint256 splitId
    );
    event updateSplit(uint256 amountReceivedByRecipient, string status);
    event escrowEvent(
        string name,
        string desc,
        string img,
        uint256 amount,
        address buyer,
        address seller,
        string status,
        uint256 escrowId
    );

    constructor(address pay_addr) {
        pay = Payment(payable(pay_addr));
    }

    function createSplit(
        uint256 amount,
        string calldata name,
        address[] calldata friendsAddress,
        uint256[] calldata friendsAmount,
        address recipient
    ) external {
        require(recipient != address(0), "Recipient cannot be zero address");
        require(friendsAddress.length >= 2, "Split Friends must be at least two");
        require(friendsAmount.length >= 2, "Split Friends must be at least two");

        uint256 generalAmount;

        for (uint256 i = 0; i < friendsAmount.length; i++) {
            generalAmount = generalAmount + friendsAmount[i];
        }
        require(amount == generalAmount, "Shared Total is not equal to amount");
        uint256 totalAmount = uint256(pay.getLatestPrice(amount));

        SplitData[splitCounter] =
            Split(name, totalAmount, 0, msg.sender, friendsAddress, "pending", recipient, splitCounter);

        uint256 Uamount;
        for (uint256 i = 0; i < friendsAddress.length; i++) {
            Uamount = uint256(pay.getLatestPrice(friendsAmount[i]));
            SplitStats[splitCounter][friendsAddress[i]] =
                SplitStat(Uamount, msg.sender, friendsAddress[i], "pending", status, splitCounter);
        }

        splitCounter++;
        emit splitEvent(name, totalAmount, 0, msg.sender, friendsAddress, "pending", recipient, splitCounter);
    }

    function acceptOrRejectSplit(bool currentStatus, uint256 splitId) external {
        if (currentStatus == true) {
            uint256 _amount = SplitStats[splitId][msg.sender].amount;

            SplitStats[splitId][msg.sender].request = PaymentStatus.accepted;
            SplitStats[splitId][msg.sender].status = "paid";

            address _to = SplitData[splitId].recipient;
            SplitData[splitId].amountReceivedByRecipient = SplitData[splitId].amountReceivedByRecipient + _amount;

            if (SplitData[splitId].amountReceivedByRecipient == SplitData[splitId].amount) {
                SplitData[splitId].status = "completed";
            }
            require(pay.balances(msg.sender) >= _amount, "Insufficient balance");
            pay.updateBalance(msg.sender, _to, _amount);
        } else if (currentStatus == false) {
            SplitStats[splitId][msg.sender].request = PaymentStatus.rejected;
            SplitStats[splitId][msg.sender].status = "rejected";
        }
        emit updateSplit(SplitData[splitId].amountReceivedByRecipient, SplitStats[splitId][msg.sender].status);
    }

    /*   
    * Create Escrow
    */
    function createEscrow(string memory name, string memory desc, string memory img, address seller, uint256 amount)
        public
    {
        uint256 maticAmount = uint256(pay.getLatestPrice(amount));
        Escrow memory esq = Escrow(name, desc, img, maticAmount, msg.sender, seller, "pending", escrowId);

        idToEscrow[escrowId] = esq;

        escrowId++;
        emit escrowEvent(name, desc, img, maticAmount, msg.sender, seller, "pending", escrowId);
    }
}
