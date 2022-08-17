import { ethers } from "ethers";
import { useState } from "react";
import Web3Modal from "web3modal";
import { create } from "ipfs-http-client";
import { useRouter } from "next/router";
import { Web3Storage } from "web3.storage";

import { shopAddress } from "../config";

import NFTShop from "../artifacts/contracts/NFTShop.sol/NFTShop.json";

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });
  const router = useRouter();
  let image;

  function onChange(e) {
    image = e.target.files[0];
  }

  function getAccessToken() {
    return process.env.NEXT_PUBLIC_WEB3_STORAGE_API_TOKEN;
  }

  function makeStorageClient() {
    return new Web3Storage({ token: getAccessToken() });
  }

  async function ipfsUpload() {
    /* upload image to IPFS */
    const { name, description, price } = formInput;
    if (!name || !description || !price || !image) return;
    const metadataFile = new File(
      [
        JSON.stringify({
          name: name,
          description: description,
          path: image.name,
        }),
      ],
      "metadata.json"
    );

    const token = process.env.NEXT_PUBLIC_WEB3_STORAGE_API_TOKEN;

    const client = new Web3Storage({ token });

    if (!token) {
      console.log(`Found the token not here: ${token}`);
    }

    try {
      const cid = await client.put([image, metadataFile]);
      console.log("Stored files with cid:", cid);
      const imageUrl = `https://${cid}.ipfs.w3s.link/${encodeURIComponent(
        image.name
      )}`;
      const metadataUrl = `https://${cid}.ipfs.w3s.link/${encodeURIComponent(
        "metadata.json"
      )}`;
      const ipfsFileUrl = "https://${cid}.ipfs.w3s.link/";
      setFileUrl(ipfsFileUrl);
      return { cid, imageUrl, metadataUrl, fileUrl };
    } catch (error) {
      console.log("Error uploading file:", error);
    }
  }

  async function listNFTForSale() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const { cid, imageUrl, metadataUrl, fileUrl } = await ipfsUpload();

    /* create the NFT */
    const price = ethers.utils.parseUnits(formInput.price, "ether");
    let contract = new ethers.Contract(shopAddress, NFTShop.abi, signer);
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();
    let transaction = await contract.createToken(cid, price, {
      value: listingPrice,
    });
    await transaction.wait();

    router.push("/");
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input
          placeholder="Asset Name"
          className="mt-8 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, name: e.target.value })
          }
        />
        <textarea
          placeholder="Asset Description"
          className="mt-2 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, description: e.target.value })
          }
        />
        <input
          placeholder="Asset Price in Eth"
          className="mt-2 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, price: e.target.value })
          }
        />
        <input type="file" name="Asset" className="my-4" onChange={onChange} />
        {fileUrl && <img className="rounded mt-4" width="350" src={fileUrl} />}
        <button
          onClick={listNFTForSale}
          className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg"
        >
          Create NFT
        </button>
      </div>
    </div>
  );
}
