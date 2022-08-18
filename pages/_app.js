import "../styles/globals.css";
import Link from "next/link";

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav class="flex items-center justify-between flex-wrap bg-gradient-to-r from-gray-700 via-gray-900 to-black p-6 content-center">
        <div class="flex items-center flex-shrink-0 text-white mr-6">
          <span class="font-semibold text-2xl tracking-tight">NFT Shop</span>
        </div>
        <div class="w-full block flex-grow content-center lg:flex lg:items-center lg:w-auto">
          <div class="text-xl lg:flex-grow content-center">
            <Link href="/">
              <a className="mr-4 text-violet-500 hover:text-sky-400">Home</a>
            </Link>
            <Link href="/create-nft">
              <a className="mr-6 text-violet-500 hover:text-sky-400">
                Sell NFT
              </a>
            </Link>
            <Link href="/my-nfts">
              <a className="mr-6 text-violet-500 hover:text-sky-400">My NFTs</a>
            </Link>
            <Link href="/dashboard">
              <a className="mr-6 text-violet-500 hover:text-sky-400">
                Dashboard
              </a>
            </Link>
          </div>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
