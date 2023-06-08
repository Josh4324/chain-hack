/* eslint-disable */
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import Side from "../../components/Side";
import React, { useState, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import payABI from "../../abis/pay.json";
import { payAddress } from "../../utils/constant";
import { toast } from "react-toastify";
import { GET_PAYLINK2 } from "../../queries";
import { subgraphQuery } from "../../utils";

import { useRouter } from "next/router";

export default function topup() {
  const router = useRouter();
  const id = router.query.request;
  const [pay, setPay] = useState([]);
  const [amount, setAmount] = useState(0);

  const createPayContract = async () => {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const payContract = new ethers.Contract(payAddress, payABI, signer);
    return payContract;
  };

  const payAmount = async (evt) => {
    evt.preventDefault();
    const contract = await createPayContract();

    const idf = router.query.request;
    const did = Number(ethers.BigNumber.from(idf));

    const id = toast.loading("Transaction in progress..");
    try {
      const tx = await contract.acceptPay(did, {
        value: pay[0].amount,
      });
      await tx.wait();
      toast.update(id, {
        render: "Transaction successfull",
        type: "success",
        isLoading: false,
        autoClose: 1000,
        closeButton: true,
      });
    } catch (error) {
      console.log(error);
      toast.update(id, {
        render: `${error.reason}`,
        type: "error",
        isLoading: false,
        autoClose: 1000,
        closeButton: true,
      });
    }
  };

  const getData = async () => {
    const id = router.query.request;
    const groupList = await subgraphQuery(GET_PAYLINK2(id));
    const data = groupList.userPayments;
    console.log(data);
    if (data) {
      setPay(data);
      const num = data[0]?.amount / 10 ** 18;
      setAmount(Number(num).toFixed(5));
    }
  };

  useEffect(() => {
    getData();
  }, [id]);

  return (
    <div className="bg">
      <div className="divider">
        <main className="home-main">
          <div className="home-header">
            <div className="home-text1">Request</div>
            <div className="profile">
              <ConnectButton />
            </div>
          </div>
          <section className="home-section1">
            <div className="reqp">
              <div className="text4">{pay[0]?.message}</div>
              <div className="text5">Amount - {amount} matic</div>
              <button onClick={payAmount} className="rbut2">
                Pay
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
