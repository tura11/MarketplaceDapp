# Marketplace DApp

This project is a decentralized marketplace application built with Solidity for the smart contract and React.js for the frontend. Users can list items for sale, purchase items, and transfer ownership of their items, all directly on the blockchain.

## Features

- **List Items:** Users can list new items for sale by providing a name and price (in ETH).
- **Purchase Items:** Buyers can purchase items by sending the exact amount of ETH as specified by the seller.
- **Transfer Ownership:** Item owners can transfer their items to another address.
- **View Items:** The DApp displays all items available for sale as well as the items owned by the connected user.
- **Blockchain Integration:** Utilizes Ethereum, ethers.js, and MetaMask to interact with the smart contract.

## Technologies Used

- **Solidity:** Smart contract development.
- **Ethereum:** Blockchain network for deploying and running the contract.
- **ethers.js:** Library for interacting with the Ethereum blockchain.
- **React.js:** Frontend library for building the user interface.
- **MetaMask:** Browser extension for managing Ethereum accounts and signing transactions.

---

## Smart Contract: `MarketPlace.sol`

### Overview

- **Data Structures:**
  - `Item`: Represents an item listed on the marketplace with properties such as id, name, price, seller, owner, and sale status.
  - `items`: Mapping of item IDs to `Item` structs.
  - `ownedItems`: Mapping of user addresses to arrays of item IDs they own.

### Main Functions

- **`listItem(string memory _name, uint _price)`**  
  Lists a new item for sale. The seller's address is stored, and the item is added to the `items` mapping and the seller's list of owned items.

- **`purchaseItem(uint _id)`**  
  Allows a user to purchase an item by sending the exact price in ETH. The function ensures the item is available, not already sold, and that the seller is not the buyer. Upon purchase, ownership is transferred and the seller receives the payment.

- **`transferItem(uint _id, address _to)`**  
  Enables the current owner to transfer an item to another address.

- **`getItemsByOwner(address _owner)`**  
  Returns an array of item IDs owned by a specific address.

---

## React Frontend: `App.js`

### Key Functionalities

- **Initialization:**  
  - Connects to Ethereum via MetaMask using ethers.js.
  - Initializes the provider, signer, and contract instance.
  - Listens for account changes and updates the state accordingly.

- **Data Loading:**  
  - **`loadItems`:** Retrieves all items from the contract.
  - **`loadOwnedItems`:** Retrieves items owned by the connected account.

- **User Interactions:**
  - **List Item:** Users input the item name and price (in ETH) to list a new item.
  - **Purchase Item:** Users can purchase an available item if they are not the owner.
  - **Transfer Item:** Users can transfer ownership of an item they own by entering the recipient's address.

### How It Works

1. **Wallet Connection:**  
   The app checks for MetaMask and requests account access. When connected, it initializes the provider, signer, and contract instance.

2. **Listing Items:**  
   Users enter item details and click the "List Item" button. The transaction is sent to the smart contract, and upon confirmation, the UI refreshes to show the new item.

3. **Purchasing Items:**  
   If a listed item is not sold and is not owned by the user, a "Purchase" button is available. When clicked, the required ETH is sent with the transaction to purchase the item.

4. **Transferring Ownership:**  
   In the "Your Items" section, users can input an address to transfer an item they own.

---

## Installation

### 1. Clone the Repository

```bash
git clone <repository_url>
cd <repository_directory>
