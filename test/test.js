const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Pay", function () {
  it("Should return the new greeting once it's changed", async function () {
    const provider = ethers.provider;
    const [owner, user1, user2, user3, user4, user5, user6] =
      await ethers.getSigners();
    const Pay = await ethers.getContractFactory("Payment");
    const pay = await Pay.deploy(owner.address);
    await pay.deployed();

    await pay.setUsername("Josh");
    await pay.connect(user1).setUsername("Esther");
    await pay.connect(user3).setUsername("Ades");
    await pay.connect(user2).setUsername("John");
    //await pay.connect(user1).setUsername("josh");

    await pay.createAddressGroup(
      [user1.address, user2.address, user3.address],
      "g1"
    );

    await pay.topUp({ value: ethers.utils.parseEther("4") });

    //await pay.connect(user3).topUp({ value: ethers.utils.parseEther("4") });

    //await pay.connect(user3).sendToUser("Josh", ethers.utils.parseEther("4"));

    console.log(await pay.balances(owner.address));

    //console.log(await provider.getBalance(owner.address));

    await pay.createPay("message", ethers.utils.parseEther("2"));
    /*  await pay.createPay("message2", ethers.utils.parseEther("100"));
    await pay.createPay("message2", ethers.utils.parseEther("100")); */

    //console.log(await pay.getCreatePayRequests(owner.address));
    console.log("here", await pay.idToPayLink(0));

    await pay
      .connect(user2)
      .acceptPay(0, { value: ethers.utils.parseEther("130") });
    console.log(await pay.balances(owner.address));

    await pay.createRaisePay("message", ethers.utils.parseEther("100"), 60);

    await pay
      .connect(user2)
      .fundPay(0, { value: ethers.utils.parseEther("130") });
    console.log(await pay.balances(owner.address));
    console.log(await pay.fundData(0));
    //console.log(await pay.getCreatePayRequests(owner.address));

    await pay.requestUser("John", ethers.utils.parseEther("100"));
    await pay.requestUser("John", ethers.utils.parseEther("200"));

    console.log(await pay.idToRequest(0));

    //console.log(await pay.connect(user2).getRequests(user2.address));

    console.log(await pay.getGroupAddr("g1"));

    console.log(await pay.balances(user2.address));

    await pay.sendToGroupD("g1", ethers.utils.parseEther("40"));
    //await pay.sendToGroupM("g1", ethers.utils.parseEther("10"));
    console.log(await pay.balances(user2.address));
  });
});
