import { ethers } from "ethers";
import { useEffect, useState } from "react";
import Web3Modal from "web3modal";

import { shopAddress } from "../config";

import NFTShop from "../artifacts/contracts/NFTShop.sol/NFTShop.json";

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  useEffect(() => {
    loadNFTs();
  }, []);
  async function loadNFTs() {
    /* create a generic provider and query for unsold market items */
    const provider = new ethers.providers.JsonRpcProvider();
    const contract = new ethers.Contract(shopAddress, NFTShop.abi, provider);
    const data = await contract.fetchMarketItems();

    /*
     *  map over items returned from smart contract and format
     *  them as well as fetch their token metadata
     */
    const items = await Promise.all(
      data.map(async (i) => {
        const cid = await contract.tokenURI(i.tokenId);
        const metadataUrl = `https://${cid}.ipfs.w3s.link/${encodeURIComponent(
          "metadata.json"
        )}`;
        const res = await fetch(metadataUrl);
        if (!res.ok) {
          throw new Error(
            `error fetching image metadata: [${res.status}] ${res.statusText}`
          );
        }
        const metadata = await res.json();
        const imageURL = `https://${cid}.ipfs.w3s.link/${encodeURIComponent(
          metadata.path
        )}`;
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: imageURL,
          name: metadata.name,
          description: metadata.description,
        };
        return item;
      })
    );
    setNfts(items);
    setLoadingState("loaded");
  }
  async function buyNft(nft) {
    /* needs the user to sign the transaction, so will use Web3Provider and sign it */
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(shopAddress, NFTShop.abi, signer);

    /* user will be prompted to pay the asking proces to complete the transaction */
    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
    const transaction = await contract.createMarketSale(nft.tokenId, {
      value: price,
    });
    await transaction.wait();
    loadNFTs();
  }
  if (loadingState === "loaded" && !nfts.length)
    return (
      <h1 className="px-20 py-10 text-3xl text-white h-screen bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900">
        No items in shop
      </h1>
    );
  return (
    <div className="flex justify-center h-screen bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900">
      <div className="px-4" style={{ maxWidth: "1600px" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft, i) => (
            <div key={i} className="border shadow rounded-xl overflow-hidden">
              <img src={nft.image} />
              <div className="p-4 bg-black">
                <p
                  style={{ height: "64px" }}
                  className="text-2xl font-semibold text-white"
                >
                  {nft.name}
                </p>
                <div style={{ height: "70px", overflow: "hidden" }}>
                  <p className="text-gray-400">{nft.description}</p>
                </div>
              </div>
              <div className="p-4 bg-black">
                <p className="text-2xl font-bold text-white">{nft.price} ETH</p>
                <button
                  className="mt-4 w-full bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500 text-white rounded p-4 shadow-lg text-white font-bold py-2 px-12 rounded"
                  onClick={() => buyNft(nft)}
                >
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
