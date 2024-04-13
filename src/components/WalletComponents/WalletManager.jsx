import React, { useEffect, useState, forwardRef, useRef, useImperativeHandle, createContext } from "react"
import { useSelector, useDispatch } from 'react-redux'
import { useSearchParams  } from "next/navigation";
import Button from '../UICommon/Button'
import MacysMagicWalletCard from "../WalletComponents/MacysMagicWalletCard"
import CoinbaseWalletCard from "../WalletComponents/CoinbaseWalletCard"
import MetaMaskCard from "../WalletComponents/MetaMaskCard"
import MagicConnectWalletCard from "../WalletComponents/MagicConnectWalletCard"
import WalletConnectCard from "../WalletComponents/WalletConnectCard"
import ConnectWalletModal from '../UICommon/ConnectWalletModal'
import MobileWalletManager from './MobileWalletManager'
import GenericModal from '../UICommon/GenericModal'
import useWalletStateSync from '../../hooks/useWalletStateSync'
import styles from '../WalletComponents/CardStyles.module.scss'

import {addWallet} from '../../reducers/AccountSlice'

const options = {
  showSwitch: true,
  showStatus: true,
  showChains: false,
  useChainSelect: true,
  showBalances: true
}

export const OptionsContext = createContext();

// eslint-disable-next-line react/display-name
const WalletManager = forwardRef(({show}, ref) => {
  const wallets = useSelector((state) => state.account.wallets)
  const [mobileMode, setMobileMode] = useState(false)
  const [mode, setMode] = useState('')
  const [modalState, setModalState] = useState(false)
  const [genericModal, setGenericModal] = useState(false)
  const [error, setError] = useState(false)
  const {handleWalletStatusChange, handleRemoveWallet, setDefaultWallet, getCurrentWalletProvider} = useWalletStateSync(wallets)
  const macysMagicCard = useRef()
  const metaMaskCard = useRef()
  const coinbaseCard = useRef()
  const magicConnectCard = useRef()
  const walletConnectCard = useRef()

  const searchParams = useSearchParams()
  const dispatch = useDispatch()

  let isMobile = false

  if (typeof window !== "undefined") {
    isMobile = (window.innerWidth < 640)
    if (isMobile) console.log("ConnectWalletModal: mobile mode on")
  }
  
  const noMMCopy = {
    title: "No MetaMask?",
    body: "Try installing the MetMask Chrome extension: <a href='https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?pli=1' target='_blank'>Get MetaMask here</a>"
  }

  useEffect(() => {
    if (wallets) console.log("WalletManager:  wallets updated: ~~~~~~~~~~~~~~~~~~~~~~~~~~~> ", wallets)
    //setError(false)
  }, [wallets])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const page_mode = params.get('mode')
    console.log("~~~~~~~~~~~~~~~~~ page mode ", page_mode)
    if (page_mode !== '') {
      setMode(page_mode)
    }
  }, [])

  const onAddWallet = () => {
    setError(false)
    setModalState(true)
  }

  const onClose = () => {
    setModalState(false)
  }

  const onCloseMacysModal = (e) => {
    setGenericModal(false)
  }

  useImperativeHandle(ref, () => {
    return {

      openConnectWalletModal() {
        console.log("WalletManager:~~~~~~~~~~~opening connect wallet modal via ref~~~~~~~~~~~~ ")
        setModalState(true)
      }
    }
  })

  const handleConnectWallet = (e, which) => {
    const exists = wallets.find((wallet) => wallet.wallet_name === which)
    if (exists) return

    setError(false)
    
    console.log("WalletManager: Trying to connect ", which)

    if (which === 'walletconnect') {
      onClose()
    }

    let updateWalletObj = {
      address: null,
      network: null,
      wallet_name: which
    }

    dispatch(addWallet(updateWalletObj));
  }

  const handleErrors = (id, error) => {
    console.log("Received an error ", error)
    setError({id: id, error: error})
    if (error.name === 'NoMetaMaskError') {
      console.log("There's been an error ", error);
      setGenericModal(true)
    }
  }

  const onContextMenuOpen = (which) => {
    if (which !== 'macys') macysMagicCard?.current?.closeContextMenu()
    if (which !== 'metamask') metaMaskCard?.current?.closeContextMenu()
    if (which !== 'coinbase') coinbaseCard?.current?.closeContextMenu()
    if (which !== 'magic') magicConnectCard?.current?.closeContextMenu()
    if (which !== 'walletconnect') walletConnectCard?.current?.closeContextMenu()
  }

  return (
    <div className={styles.walletManager}>

        <OptionsContext.Provider value={options}>
          {(wallets && wallets.length > 0) && 
            <ul>
              {
                wallets.map((wallet) => {
                  switch(wallet.wallet_name) {
                    case 'macys':
                      return <MacysMagicWalletCard 
                              key={wallet.address}
                              ref={macysMagicCard} 
                              show={show}
                              account={wallet.address} 
                              onStatusChange={handleWalletStatusChange} 
                              onRemoveWallet={handleRemoveWallet} 
                              onSetDefaultWallet={setDefaultWallet}
                              onError={handleErrors}
                              onContextMenuOpen = {onContextMenuOpen}
                            />
                    case 'metamask':
                      return <MetaMaskCard 
                              key={wallet.address}
                              ref={metaMaskCard} 
                              show={show}
                              account={wallet.address} 
                              onStatusChange={handleWalletStatusChange} 
                              onRemoveWallet={handleRemoveWallet} 
                              onSetDefaultWallet={setDefaultWallet}
                              onError={handleErrors}
                              onContextMenuOpen = {onContextMenuOpen}
                            />
                    case 'coinbase':
                      return <CoinbaseWalletCard 
                              key={wallet.address}
                              ref={coinbaseCard} 
                              show={show}
                              account={wallet.address} 
                              onStatusChange={handleWalletStatusChange} 
                              onRemoveWallet={handleRemoveWallet} 
                              onSetDefaultWallet={setDefaultWallet}
                              onError={handleErrors}
                              onContextMenuOpen = {onContextMenuOpen}
                            />
                    case 'magic':
                      return <MagicConnectWalletCard 
                              key={wallet.address}
                              ref={magicConnectCard} 
                              show={show}
                              account={wallet.address} 
                              onStatusChange={handleWalletStatusChange} 
                              onRemoveWallet={handleRemoveWallet} 
                              onSetDefaultWallet={setDefaultWallet}
                              onError={handleErrors}
                              onContextMenuOpen = {onContextMenuOpen}
                            />
                    case 'walletconnect':
                      return <WalletConnectCard 
                              key={wallet.address}
                              ref={walletConnectCard} 
                              show={show}
                              account={wallet.address} 
                              onStatusChange={handleWalletStatusChange} 
                              onRemoveWallet={handleRemoveWallet} 
                              onSetDefaultWallet={setDefaultWallet}
                              onError={handleErrors}
                              onContextMenuOpen = {onContextMenuOpen}
                            />
                  }
                })
              }
            </ul>}

            {(isMobile && mode) && <MobileWalletManager
                mode={mode}
                handleWalletStatusChange = {handleWalletStatusChange}
                handleRemoveWallet = {handleRemoveWallet}
                setDefaultWallet = {setDefaultWallet}
                handleErrors = {handleErrors}
                onContextMenuOpen = {onContextMenuOpen}
              />}
              
            {(isMobile && !mode) && <p>
                NOTE: if you want to connect to either Metamask or Coinbase without going through wallet connect, you will have to continue on the mobile wallet browser, click on Link Additional Digital Addresses and follow the instructions.
              </p>
            }

          {!mode && <Button onClick={onAddWallet}>Link Additional Digital Addresses</Button>}

          <ConnectWalletModal 
            onConnectWallet={handleConnectWallet} 
            onCloseModal={onClose} 
            showModal={modalState} 
            onError={error}
          />
          <GenericModal 
            onCloseModal={onCloseMacysModal} 
            showModal={genericModal} 
            copy={noMMCopy} 
          />  
        </OptionsContext.Provider>
       
    </div>
  )
})

export default WalletManager