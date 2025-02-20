# Marketplace DApp Smart Contract Tests

Below are example tests for the `MarketPlace` smart contract using Hardhat and Mocha. These tests cover listing items, purchasing items, transferring ownership, and retrieving items by owner.

Make sure you have Hardhat set up in your project. Save the following code as `test/MarketPlace.js` and run the tests with the command `npx hardhat test`.

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MarketPlace", function () {
  let marketPlace;
  let owner, seller, buyer, other;

  beforeEach(async function () {
    [owner, seller, buyer, other] = await ethers.getSigners();
    const MarketPlaceFactory = await ethers.getContractFactory("MarketPlace");
    marketPlace = await MarketPlaceFactory.deploy();
    await marketPlace.deployed();
  });

  describe("Listing Items", function () {
    it("should list an item successfully", async function () {
      const price = ethers.utils.parseEther("1");
      await marketPlace.connect(seller).listItem("Item1", price);

      const item = await marketPlace.items(1);
      expect(item.id).to.equal(1);
      expect(item.name).to.equal("Item1");
      expect(item.price).to.equal(price);
      expect(item.seller).to.equal(seller.address);
      expect(item.owner).to.equal(seller.address);
      expect(item.isSold).to.equal(false);
    });

    it("should revert when trying to list an item with price 0", async function () {
      await expect(
        marketPlace.connect(seller).listItem("Item1", 0)
      ).to.be.revertedWith("Price must be greater than 0");
    });
  });

  describe("Purchasing Items", function () {
    beforeEach(async function () {
      const price = ethers.utils.parseEther("1");
      await marketPlace.connect(seller).listItem("Item1", price);
    });

    it("should allow a buyer to purchase an item", async function () {
      const price = ethers.utils.parseEther("1");

      // Buyer purchases the item
      await expect(
        marketPlace.connect(buyer).purchaseItem(1, { value: price })
      ).to.changeEtherBalances(
        [seller, buyer],
        [price, price.mul(-1)]
      );

      const item = await marketPlace.items(1);
      expect(item.isSold).to.equal(true);
      expect(item.owner).to.equal(buyer.address);
    });

    it("should revert if buyer sends an incorrect price", async function () {
      const wrongPrice = ethers.utils.parseEther("0.5");
      await expect(
        marketPlace.connect(buyer).purchaseItem(1, { value: wrongPrice })
      ).to.be.revertedWith("Incorrect price");
    });

    it("should revert if trying to purchase an already sold item", async function () {
      const price = ethers.utils.parseEther("1");

      // Buyer purchases the item first
      await marketPlace.connect(buyer).purchaseItem(1, { value: price });

      // Another account cannot purchase the same item
      await expect(
        marketPlace.connect(other).purchaseItem(1, { value: price })
      ).to.be.revertedWith("Item already sold");
    });

    it("should revert if seller tries to purchase their own item", async function () {
      const price = ethers.utils.parseEther("1");
      await expect(
        marketPlace.connect(seller).purchaseItem(1, { value: price })
      ).to.be.revertedWith("Seller cannot buy thier own item");
    });
  });

  describe("Transferring Items", function () {
    beforeEach(async function () {
      const price = ethers.utils.parseEther("1");
      await marketPlace.connect(seller).listItem("Item1", price);
      await marketPlace.connect(buyer).purchaseItem(1, { value: price });
    });

    it("should allow the owner to transfer an item", async function () {
      // Buyer (current owner) transfers the item to 'other'
      await marketPlace.connect(buyer).trasnferItem(1, other.address);
      const item = await marketPlace.items(1);
      expect(item.owner).to.equal(other.address);
    });

    it("should revert when a non-owner attempts to transfer an item", async function () {
      // Seller is not the owner after the purchase
      await expect(
        marketPlace.connect(seller).trasnferItem(1, seller.address)
      ).to.be.revertedWith("UR not the owner of this item");
    });

    it("should revert when trying to transfer a non-existent item", async function () {
      await expect(
        marketPlace.connect(buyer).trasnferItem(999, other.address)
      ).to.be.revertedWith("Item does not exists");
    });
  });

  describe("Getting Items by Owner", function () {
    it("should return all items owned by a specific address", async function () {
      const price1 = ethers.utils.parseEther("1");
      const price2 = ethers.utils.parseEther("2");

      // Seller lists two items
      await marketPlace.connect(seller).listItem("Item1", price1);
      await marketPlace.connect(seller).listItem("Item2", price2);

      const ownedItemIds = await marketPlace.getItemsByOwner(seller.address);
      expect(ownedItemIds.length).to.equal(2);
      expect(ownedItemIds[0]).to.equal(1);
      expect(ownedItemIds[1]).to.equal(2);
    });
  });
});
