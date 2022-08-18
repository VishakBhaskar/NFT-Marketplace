import { ethers } from "ethers";
import React, { useState } from "react";
import Web3Modal, { Modal } from "web3modal";
import { create } from "ipfs-http-client";
import { useRouter } from "next/router";
import { Web3Storage } from "web3.storage";

import { shopAddress } from "../config";

import NFTShop from "../artifacts/contracts/NFTShop.sol/NFTShop.json";

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
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

    if (!token) {
      console.log(`Found the token not here: ${token}`);
    }

    try {
      const onRootCidReady = (cid) => {
        console.log("uploading files with cid:", cid);
      };
      const totalSize = [image, metadataFile]
        .map((f) => f.size)
        .reduce((a, b) => a + b, 0);
      let uploaded = 0;

      const onStoredChunk = (size) => {
        uploaded += size;
        const pct = 100 * (uploaded / totalSize);
        console.log(`Uploading... ${pct.toFixed(2)}% complete`);
      };
      const client = new Web3Storage({ token });
      const cid = await client.put([image, metadataFile], {
        onRootCidReady,
        onStoredChunk,
      });
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
    uploadModal(cid);

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

  const uploadModal = (cid) => {
    setShowModal(true);
    return (
      <>
        <button
          className="bg-pink-500 text-white active:bg-pink-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
          type="button"
          onClick={() => setShowModal(true)}
        >
          Open regular modal
        </button>
        {showModal ? (
          <>
            <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
              <div className="relative w-auto my-6 mx-auto max-w-3xl">
                {/*content*/}
                <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                  {/*header*/}
                  <div className="flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t">
                    <h3 className="text-3xl font-semibold">Yayyy!</h3>
                    <button
                      className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                      onClick={() => setShowModal(false)}
                    >
                      <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                        ×
                      </span>
                    </button>
                  </div>
                  {/*body*/}
                  <div className="relative p-6 flex-auto">
                    <p className="my-4 text-slate-500 text-lg leading-relaxed">
                      Uploading your NFT with CID : {cid}
                    </p>
                  </div>
                  {/*footer*/}
                  <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                    <button
                      className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                      type="button"
                      onClick={() => setShowModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
          </>
        ) : null}
      </>
    );
  };

  return (
    <div className="flex justify-center h-screen bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900">
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
          className="font-bold mt-4 bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500 text-white rounded p-4 shadow-lg"
        >
          Create NFT
        </button>
      </div>
    </div>
  );
}

//Modal
