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
import { useRouter } from "next/router";
import "react-toastify/dist/ReactToastify.css";
import { GET_GROUP } from "../queries";
import { subgraphQuery } from "../utils";

export default function dashboard() {
  const { address } = useAccount();
  const [wallet, setWallet] = useState("");
  const [balance, setBalance] = useState(0);
  const [dollar, setDollar] = useState(0);
  const [user, setUser] = useState("");
  const [groupArray, setList] = useState([]);
  const [fr, setFr] = useState([1]);
  const userRef = useRef();
  const tref = useRef();
  const nameRef = useRef();

  const createPayContract = async () => {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const payContract = new ethers.Contract(payAddress, payABI, signer);
    return payContract;
  };

  const sWallet = () => {
    setWallet(address);
  };

  const getBalance = async () => {
    const contract = await createPayContract();
    const balance = await contract.balances(address);
    const price = await contract.getLatest();
    const priceD = Number(ethers.BigNumber.from(price)) / 10 ** 18;
    const bal = Number(ethers.BigNumber.from(balance)) / 10 ** 18;
    setBalance(Number(ethers.BigNumber.from(balance)) / 10 ** 18);
    setDollar(priceD * bal);
  };

  const setUsername = async (name) => {
    const contract = await createPayContract();
    const id = toast.loading("Transaction in progress..");
    try {
      const tx = await contract.setUsername(name);
      await tx.wait();
      const usr = await contract.AddrToUser(address);
      setUser(usr);
      userRef.current.value = "";
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

  const getUser = async () => {
    const contract = await createPayContract();
    const user = await contract.AddrToUser(address);
    setUser(user);
  };

  const getTasks = async () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const wlist = await provider.listAccounts();
    const groupList = await subgraphQuery(GET_GROUP(String(wlist[0])));
    const data = groupList.groupCreations;
    setList(data);
  };

  const add = (evt) => {
    evt.preventDefault();
    setFr([1, ...fr]);
  };

  const createGroup = (evt) => {
    if (nameRef.current.value === "") {
      return toast.error("Please enter the group name");
    }
    evt.preventDefault();
    const arr = [];
    const children = Array.from(tref.current.children);
    children.map((item) => {
      if (!ethers.utils.isAddress(item.value)) {
        toast.error("Invalid Address");
      }
      arr.push(item.value);
    });

    console.log(arr, nameRef.current.value);

    createG(arr, nameRef.current.value);
  };

  const createG = async (group, name) => {
    const contract = await createPayContract();
    const id = toast.loading("Transaction in progress..");
    try {
      const tx = await contract.createAddressGroup(group, name);
      await tx.wait();
      toast.update(id, {
        render: "Transaction successfull",
        type: "success",
        isLoading: false,
        autoClose: 1000,
        closeButton: true,
      });
      tref.current.reset();
      nameRef.current.value = "";
      setTimeout(() => (window.location.href = "/dashboard"), 10000);
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

  useEffect(() => {
    sWallet();
    getBalance();
    getUser();
    getTasks();
  }, [address]);

  return (
    <div className="bg">
      <div className="divider">
        <Side />
        <main className="home-main">
          <div className="home-header">
            <div className="home-text1">Dashboard</div>
            <div className="profile">
              <ConnectButton />
            </div>
          </div>
          <section className="home-section1">
            <div className="cardflex">
              <div className="cardw">
                <div className="wcard-text2">
                  {user.length > 0 ? `@${user}` : ""}
                </div>
                <div className="wcard-text1">{wallet}</div>
                <div>
                  <div className="wcard-text2">
                    {balance.toFixed(5)} matic (${dollar.toFixed(5)})
                  </div>
                </div>
              </div>

              <div className="cardu">
                <input
                  ref={userRef}
                  className="input"
                  placeholder="Enter Username"
                />
                <button
                  onClick={() => setUsername(userRef.current.value)}
                  className="rbut"
                >
                  Update
                </button>
              </div>
            </div>

            <div className="cardflex">
              <Link href="/topup">
                <div className="wcard1">
                  <img src="./add.svg" alt="add" />
                  <div className="wcard-text4">Top Up</div>
                </div>
              </Link>

              <Link href="/request">
                <div className="wcard2">
                  <img src="./add.svg" alt="add" />
                  <div className="wcard-text5">Request</div>
                </div>
              </Link>

              <Link href="/send">
                <div className="wcard1">
                  <img src="./add.svg" alt="add" />
                  <div className="wcard-text4">Send</div>
                </div>
              </Link>

              <Link href="/payment">
                <div className="wcard2">
                  <img src="./add.svg" alt="add" />
                  <div className="wcard-text5">Payment Link</div>
                </div>
              </Link>
            </div>

            <div className="cardflex">
              <div className="group">
                <div className="wcard-text2" style={{ marginBottom: "30px" }}>
                  Create Group
                </div>
                <input
                  ref={nameRef}
                  className="input"
                  placeholder="Enter Name of Group"
                />

                <label style={{ paddingBottom: "10px", display: "block" }}>
                  Friend Address
                </label>

                <form ref={tref}>
                  {fr.map((item, index) => {
                    return (
                      <input
                        key={index}
                        className="input"
                        placeholder="Enter Friend Wallet"
                      />
                    );
                  })}
                </form>

                <button
                  onClick={add}
                  className="rbut"
                  style={{ marginBottom: "30px" }}
                >
                  Add another friend
                </button>
                <button onClick={createGroup} className="rbut">
                  Create Group
                </button>
              </div>

              <div className="group">
                <div className="wcard-text2" style={{ marginBottom: "30px" }}>
                  Group
                </div>
                {groupArray?.map((item) => {
                  return <div className="text21">{item.groupName}</div>;
                })}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
