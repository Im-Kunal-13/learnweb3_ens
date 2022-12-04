import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Web3Modal from "web3modal"
import { ethers, providers } from "ethers"
import { useEffect, useRef, useState } from "react"

export default function Home() {
  // To keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false)
  // Reference to the web3 modal (used for connecting to Metamask) hiwch persists as long as the page is open
  const web3ModalRef = useRef()
  // Ens
  const [ens, setEns] = useState("")
  // Save the address of the currently connected account
  const [address, setAddress] = useState("")

  // Sets, the ENS, if the current connected address has an associated ENS or else it sets
  // the address of the connected account
  const setEnsOrAddress = async (address, web3Provider) => {
    // Lookup the ENS related to the given address
    var _ens = await web3Provider.lookupAddress(address)
    // If the address has an associated ENS, then set the ens address or just set the address
    if (_ens) {
      setEns(_ens)
    }
    else {
      setAddress(address)
    }
  }

  const getProviderOrSigner = async () => {
    // Conect to metamask
    // since we store 'web3Modal' as a reference, we need to access the 'current' value to get access to the underlying object
    const provider = await web3ModalRef.current.connect()
    const web3Provider = new providers.Web3Provider(provider)

    // If user is not connected to the Goreli network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork()

    if (chainId !== 5) {
      window.alert("Change the network to goreli")
      throw new Error("Change the network to Goreli")
    }

    const signer = web3Provider.getSigner()
    // Calls the address associated to the signer which is connected to Metamask
    const address = await signer.getAddress()
    // calling the function to set the ens or address
    await setEnsOrAddress(address, web3Provider)
    return signer

  }

  // Connects the wallet to metamask
  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is Metamask
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner(true)
      setWalletConnected(true)
    } catch (error) {
      console.error(error)
    }
  }

  // renderButton: Returns a button based on the state of hte dapp
  const renderButton = () => {
    if (walletConnected) {
      <div>Wallet Connected</div>
    }
    else {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      )
    }
  }

  useEffect(() => {
    // if wallet is not connected, create a new instance of web3Modal and connect the Metamask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's 'current' value
      // The 'current' value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false
      })
      connectWallet()
    }
  }, [walletConnected])

  return (
    <div>
      <Head>
        <title>ENS Dapp</title>
        <meta name="description" content="ENS-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>
            Welcome to LearnWeb3 Punks {ens ? ens : address}!
          </h1>
          <div className={styles.description}>
            Its an NFT collection for LearnWeb3 Punks.
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./learnweb3punks.png" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by LearnWeb3 Punks
      </footer>
    </div>
  )
}
