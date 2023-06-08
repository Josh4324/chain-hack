/* eslint-disable */
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import Side from "../components/Side";
import React, { useState, useEffect, useRef } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import payABI from "../abis/pay.json";
import { payAddress } from "../utils/constant";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GET_PAYLINK, GET_RAISEPAY } from "../queries";
import { subgraphQuery } from "../utils";

export default function payment() {
  const amountRef = useRef();
  const messageRef = useRef();

  const amountRef2 = useRef();
  const messageRef2 = useRef();
  const deadRef = useRef();

  const [paylink, setPaylink] = useState([]);
  const [paylink2, setPaylink2] = useState([]);

  const createPayContract = async () => {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const payContract = new ethers.Contract(payAddress, payABI, signer);
    return payContract;
  };

  const paymentLink = async (evt) => {
    evt.preventDefault();
    const contract = await createPayContract();
    if (amountRef.current.value === "" || messageRef.current.value === "") {
      return toast.error("Please enter the complete details");
    }
    const amount = ethers.utils.parseEther(amountRef.current.value);
    const message = messageRef.current.value;

    const id = toast.loading("Transaction in progress..");
    try {
      const tx = await contract.createPay(message, amount);
      await tx.wait();
      amountRef.current.value = "";
      messageRef.current.value = "";
      toast.update(id, {
        render: "Transaction successfull",
        type: "success",
        isLoading: false,
        autoClose: 1000,
        closeButton: true,
      });
      setTimeout(() => (window.location.href = "/payment"), 10000);
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

  const payRaise = async (evt) => {
    evt.preventDefault();
    const contract = await createPayContract();
    if (
      amountRef2.current.value === "" ||
      messageRef2.current.value === "" ||
      deadRef.current.value == ""
    ) {
      return toast.error("Please enter all the details");
    }
    const amount = ethers.utils.parseEther(amountRef2.current.value);
    const message = messageRef2.current.value;
    const deadline = Number(deadRef.current.value) * 60 * 60;

    const id = toast.loading("Transaction in progress..");
    try {
      const tx = await contract.createRaisePay(message, amount, deadline);
      await tx.wait();
      amountRef2.current.value = "";
      messageRef2.current.value = "";
      deadRef.current.value = "";
      toast.update(id, {
        render: "Transaction successfull",
        type: "success",
        isLoading: false,
        autoClose: 1000,
        closeButton: true,
      });
      setTimeout(() => (window.location.href = "/payment"), 10000);
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

  const getPayLink = async () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const wlist = await provider.listAccounts();
    const groupList = await subgraphQuery(GET_PAYLINK(String(wlist[0])));
    const data = groupList.userPayments;
    console.log(data);
    setPaylink(data);
  };

  const getRaiseLink = async () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const wlist = await provider.listAccounts();
    const groupList = await subgraphQuery(GET_RAISEPAY(String(wlist[0])));
    const data = groupList.raisePayments;
    console.log("2", data);
    setPaylink2(data);
  };

  useEffect(() => {
    getPayLink();
    getRaiseLink();
  }, []);

  return (
    <div className="bg">
      <div className="divider">
        <Side />
        <main className="home-main">
          <div className="home-header">
            <div className="home-text1">Payment Link</div>
            <div className="profile">
              <ConnectButton />
            </div>
          </div>
          <section className="home-section1">
            <div className="cardflex">
              <div className="topup">
                <div className="wcard-text2" style={{ marginBottom: "30px" }}>
                  Create Payment Link to Request Payment
                </div>
                <input
                  ref={messageRef}
                  className="input"
                  placeholder="Enter message or info"
                />
                <input
                  ref={amountRef}
                  className="input"
                  placeholder="Enter Amount in dollars"
                />
                <button onClick={paymentLink} className="rbut">
                  Submit
                </button>
              </div>

              <div className="topup">
                <div className="wcard-text2" style={{ marginBottom: "30px" }}>
                  Create Payment Link to Raise Money
                </div>
                <input
                  ref={messageRef2}
                  className="input"
                  placeholder="Enter message or info"
                />
                <input
                  ref={amountRef2}
                  className="input"
                  placeholder="Enter Amount in dollars"
                />

                <input
                  ref={deadRef}
                  className="input"
                  placeholder="Enter duration for raise in hours"
                />
                <button onClick={payRaise} className="rbut">
                  Submit
                </button>
              </div>
            </div>

            <div className="text3">Request Payment</div>
            <table id="customers">
              <tbody>
                <tr>
                  <th>Id</th>
                  <th>Amount</th>
                  <th>Creator</th>
                  <th>Payer</th>
                  <th>Status</th>
                  <th>Copy Link</th>
                </tr>
                {paylink.map((item) => {
                  return (
                    <tr>
                      <td>{item.id}</td>
                      <td>{Number(item.amount / 10 ** 18).toFixed(5)} matic</td>
                      <td>{item.creator}</td>
                      <td>{item.payer}</td>
                      <td>{item.status === true ? "Paid" : "Pending"}</td>
                      <td>
                        <CopyToClipboard
                          text={`http://localhost:3000/request/${item.id}`}
                        >
                          <button>Copy Payment Link</button>
                        </CopyToClipboard>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="text3">Raise Money</div>
            <table id="customers">
              <tbody>
                <tr>
                  <th>Id</th>
                  <th>Amount Needed</th>
                  <th>Creator</th>
                  <th>Amount Raised</th>
                  <th>Status</th>
                  <th>Copy Link</th>
                </tr>
                {paylink2.map((item) => {
                  return (
                    <tr>
                      <td>{item.id}</td>
                      <td>{Number(item.amount / 10 ** 18).toFixed(5)} matic</td>
                      <td>{item.creator}</td>
                      <td>
                        {Number(item.amountRaised / 10 ** 18).toFixed(5)} matic
                      </td>
                      <td>{item.status === true ? "Paid" : "Pending"}</td>
                      <td>
                        <CopyToClipboard
                          text={`http://localhost:3000/raise/${item.id}
                          `}
                        >
                          <button>Copy Payment Link</button>
                        </CopyToClipboard>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        </main>
      </div>
    </div>
  );
}
