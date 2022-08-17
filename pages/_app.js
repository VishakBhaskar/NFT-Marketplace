import '../styles/globals.css'
import Link from 'next/link'

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav className="border-b p-1 bg-gradient-to-r from-gray-700 via-gray-900 to-black">
        <p className="text-4xl text-violet-400 font-mono tracking-wide font-bold">EnEfTee Shop</p>
        <div className="flex mt-4 place-content-center space-x-20">
          <Link href="/">
            <a className="mr-4 text-violet-500 hover:text-sky-400">
              Home
            </a>
          </Link>
          <Link href="/create-nft">
            <a className="mr-6 text-violet-500 hover:text-sky-400">
              Sell NFT
            </a>
          </Link>
          <Link href="/my-nfts">
            <a className="mr-6 text-violet-500 hover:text-sky-400">
              My NFTs
            </a>
          </Link>
          <Link href="/dashboard">
            <a className="mr-6 text-violet-500 hover:text-sky-400">
              Dashboard
            </a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
