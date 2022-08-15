const hre = require("hardhat");
const fs = require("fs")

async function main() {
  const NFTShopFactory = await hre.ethers.getContractFactory("NFTShop");
  const nftShop = await NFTShopFactory.deploy();
  await nftShop.deployed();
  console.log("nftShop deployed to:", nftShop.address);

  fs.writeFileSync('./config.js', `
  export const shopAddress = "${nftShop.address}"
  `)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
