const { expect } = require('chai');
const { ethers } = require('hardhat');

 describe("NFT Shop", function() {
    let buyer, seller, shopOwner, reseller;
    let nftShop
  before(async function() {
    // await this.nftShop.deployed();
    
    [buyer, seller, shopOwner, reseller] = await ethers.getSigners()
    
    const NFTShopFactory = await ethers.getContractFactory("NFTShop")
    nftShop = await NFTShopFactory.connect(shopOwner).deploy();

    const auctionprice = ethers.utils.parseUnits("1", "ether");
    let listingFee = await nftShop.getListingPrice()
    listingFee = listingFee.toString();
    await nftShop.connect(seller).createToken("idk/somerandontokenURI:1", auctionprice, {value: listingFee});
    await nftShop.connect(seller).createToken("idk/somerandontokenURI:2", auctionprice, {value: listingFee});
    await nftShop.connect(seller).createToken("idk/somerandontokenURI:3", auctionprice, {value: listingFee});
    await nftShop.connect(seller).createToken("idk/somerandontokenURI:4", auctionprice, {value: listingFee});
  });

  it("Mints NFT,adds it to the shop, displays items", async function() {
    
    let items = await nftShop.fetchMarketItems();
    items = await Promise.all(items.map(async i => {
      let tokenURI = await nftShop.tokenURI(i.tokenId)
      let item = {
        TokenID: i.tokenId.toString(),
        Seller: i.seller,
        Owner: i.owner,
        Price: i.price.toString(),
        URI: tokenURI
      }
      return item;
    }));
    console.log(items)
  });

  it("Market sale happens, seller gets the amount, Market Owner gets the listing fee", async function() {
    let price = await nftShop.getNFTPrice(1);
    let listingFee = await nftShop.getListingPrice()
    this.ownerInitialBalance = await ethers.provider.getBalance(shopOwner.address);
    await nftShop.connect(buyer).createMarketSale(1, {value: price});
    expect(
      await ethers.provider.getBalance(shopOwner.address)
  ).to.equal(this.ownerInitialBalance.add(listingFee));
  });

  it("Owner resells NFT, pays comission to market owner", async function() {
    let price = await nftShop.getNFTPrice(2);
    let listingFee = await nftShop.getListingPrice()
    this.ownerInitialBalance = await ethers.provider.getBalance(shopOwner.address);
    
    //Buyer buys the NFT and becomes the owner
    await nftShop.connect(buyer).createMarketSale(2, {value: price});

    //Shop Owner gets the listing fee
    expect(
      await ethers.provider.getBalance(shopOwner.address)
  ).to.equal(this.ownerInitialBalance.add(listingFee));

  this.ownerInitialBalance = await ethers.provider.getBalance(shopOwner.address)
  console.log(this.ownerInitialBalance);

  //Buyer decides to resell the NFT
  const sellingPrice = ethers.utils.parseEther("2")
  // sellingPrice.toString()
  await nftShop.connect(buyer).resellToken(2, sellingPrice, {value: listingFee})

//   expect(
//     await ethers.provider.getBalance(shopOwner.address)
// ).to.equal(this.ownerInitialBalance.add(listingFee));

  });

 })


