/* eslint-disable */
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import Side from "../components/Side";
import React, { useState, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import payABI from "../abis/pay.json";
import { payAddress } from "../utils/constant";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function topup() {
  const amountRef = useRef();
  const amountRef2 = useRef();
  const walletRef = useRef();

  const createPayContract = async () => {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const payContract = new ethers.Contract(payAddress, payABI, signer);
    return payContract;
  };

  const topup = async (evt) => {
    evt.preventDefault();
    const contract = await createPayContract();
    if (amountRef.current.value === "") {
      return toast.error("Please enter the amount");
    }
    const amount = ethers.utils.parseEther(amountRef.current.value);
    const id = toast.loading("Transaction in progress..");
    try {
      const tx = await contract.topUp({ value: amount });
      await tx.wait();
      amountRef.current.value = "";
      toast.update(id, {
        render: "Transaction successfull",
        type: "success",
        isLoading: false,
        autoClose: 1000,
        closeButton: true,
      });
      setTimeout(() => (window.location.href = "/dashboard"), 5000);
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

  const withdraw = async (evt) => {
    evt.preventDefault();
    const contract = await createPayContract();
    if (amountRef2.current.value === "" || walletRef.current.value === "") {
      return toast.error("Please enter the complete details");
    }
    const amount = ethers.utils.parseEther(amountRef2.current.value);
    const waddres = walletRef.current.value;

    const id = toast.loading("Transaction in progress..");
    try {
      const tx = await contract.withdraw(waddres, amount);
      await tx.wait();
      amountRef.current.value = "";
      toast.update(id, {
        render: "Transaction successfull",
        type: "success",
        isLoading: false,
        autoClose: 1000,
        closeButton: true,
      });
      setTimeout(() => (window.location.href = "/dashboard"), 5000);
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

  return (
    <div className="bg">
      <div className="divider">
        <Side />
        <main className="home-main">
          <div className="home-header">
            <div className="home-text1">Top Up</div>
            <div className="profile">
              <ConnectButton />
            </div>
          </div>
          <section className="home-section1">
            <div className="cardflex">
              <div className="topup">
                <div className="wcard-text2" style={{ marginBottom: "30px" }}>
                  Top Up Matic
                </div>
                <input
                  ref={amountRef}
                  className="input"
                  placeholder="Enter Amount in matic"
                />
                <button onClick={topup} className="rbut">
                  Submit
                </button>
              </div>

              <div className="topup">
                <div className="wcard-text2" style={{ marginBottom: "30px" }}>
                  Withdraw
                </div>
                <input
                  ref={amountRef2}
                  className="input"
                  placeholder="Enter Amount in matic"
                />
                <input
                  ref={walletRef}
                  className="input"
                  placeholder="Enter Wallet Address"
                />
                <button onClick={withdraw} className="rbut">
                  Submit
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
