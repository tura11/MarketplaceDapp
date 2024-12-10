

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import './App.css';
import ABI from "./contractAbi";

function App() {
  const CONTRACT_ADDRESS = "0x180fd7562c6ae51bb36cdd18e34562a95b85c44e";    //0xc7499436241d97f3a6c6718389652bf6faa9565

    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState("");
    const [items, setItems] = useState([]);
    const [ownedItems, setOwnedItems] = useState([]);

    // Initialize the application and load data
    useEffect(() => {
        const init = async () => {
            if (typeof window.ethereum !== "undefined") {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                setProvider(provider);

                // Listen for account changes in MetaMask
                window.ethereum.on("accountsChanged", async (accounts) => {
                    setAccount(accounts[0]);
                    const signer = provider.getSigner();
                    setSigner(signer);
                    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
                    setContract(contract);
                    loadItems(contract);
                    loadOwnedItems(contract, accounts[0]);
                });

                const accounts = await provider.send("eth_requestAccounts", []);
                setAccount(accounts[0]);

                const signer = provider.getSigner();
                setSigner(signer);

                const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
                setContract(contract);

                loadItems(contract);
                loadOwnedItems(contract, accounts[0]);
            }
        };
        init();
    }, []);

    const loadItems = async (contract) => {
        const itemCount = await contract.itemCount();
        let items = [];
        for (let i = 1; i <= itemCount; i++) {
            const item = await contract.items(i);
            items.push(item);
        }
        setItems(items);````
    };

    const loadOwnedItems = async (contract, owner) => {
        const ownedItemIds = await contract.getItemsByOwner(owner);
        let ownedItems = [];
        for (let i = 0; i < ownedItemIds.length; i++) {
            const item = await contract.items(ownedItemIds[i]);
            ownedItems.push(item);
        }
        setOwnedItems(ownedItems);
    };

    const listItem = async (name, price) => {
        const tx = await contract.listItem(name, ethers.utils.parseEther(price));
        await tx.wait();
        loadItems(contract);
    };

    const purchaseItem = async (id, price) => {
        const tx = await contract.purchaseItem(id, { value: ethers.utils.parseEther(price) });
        await tx.wait();
        loadItems(contract);
        loadOwnedItems(contract, account);
    };

    const transferItem = async (id, toAddress) => {
        const tx = await contract.transferItem(id, toAddress);
        await tx.wait();
        loadItems(contract);
        loadOwnedItems(contract, account);
    };

    return (
      <div className="App">
          <h1>Marketplace</h1>
          <div className="list-item">
              <h2>List Item</h2>
              <input id="itemName" placeholder="Item Name" className="input-field" />
              <input id="itemPrice" placeholder="Item Price (in ETH)" className="input-field" />
              <button className="button" onClick={() => listItem(
                  document.getElementById("itemName").value,
                  document.getElementById("itemPrice").value
              )}>
                  List Item
              </button>
          </div>

          <div className="items">
              <h2>Items for Sale</h2>
              {items.map((item) => (
                  <div key={item.id} className="item-card">
                      <p><strong>Name:</strong> {item.name}</p>
                      <p><strong>Price:</strong> {ethers.utils.formatEther(item.price)} ETH</p>
                      <p><strong>Owner:</strong> {item.owner}</p>
                      {!item.isSold && item.owner.toLowerCase() !== account.toLowerCase() && (
                          <button className="button" onClick={() => purchaseItem(item.id, ethers.utils.formatEther(item.price))}>
                              Purchase
                          </button>
                      )}
                  </div>
              ))}
          </div>

          <div className="owned-items">
              <h2>Your Items</h2>
              {ownedItems.map((item) => (
                  <div key={item.id} className="item-card">
                      <p><strong>Name:</strong> {item.name}</p>
                      <p><strong>Price:</strong> {ethers.utils.formatEther(item.price)} ETH</p>
                      <p><strong>Owner:</strong> {item.owner}</p>
                      <input id={`transferAddress${item.id}`} placeholder="Transfer to Address" className="input-field" />
                      <button className="button" onClick={() => transferItem(item.id, document.getElementById(`transferAddress${item.id}`).value)}>
                          Transfer
                      </button>
                  </div>
              ))}
          </div>
      </div>
  );
}

export default App;