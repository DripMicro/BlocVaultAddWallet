import React, {useState, useEffect} from 'react';
import Web3 from "web3";
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import evmChains from 'evm-chains';
import Fortmatic from 'fortmatic';
import { store } from "react-notifications-component";
import Onboard from 'bnc-onboard'
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { initOnboard, initNotify } from './services.js';
import { styled } from '@mui/material/styles';
import { purple } from '@mui/material/colors';
import BVToken from "../../contracts/BVToken.json";
import PublicSale from "../../contracts/PublicSale.json";
import avatarPlaceholder from './avatar-placeholder.png'
import networkEnum from './networkEnum'
import "react-notifications-component/dist/theme.css";
import "../css/style.css";


const BootstrapButton = styled(Button)({
    boxShadow: 'none',
    textTransform: 'none',
    fontSize: 16,
    padding: '6px 12px',
    border: '1px solid',
    lineHeight: 1.5,
    backgroundColor: '#0063cc',
    borderColor: '#0063cc',
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    '&:hover': {
      backgroundColor: '#0069d9',
      borderColor: '#0062cc',
      boxShadow: 'none',
    },
    '&:active': {
      boxShadow: 'none',
      backgroundColor: '#0062cc',
      borderColor: '#005cbf',
    },
    '&:focus': {
      boxShadow: '0 0 0 0.2rem rgba(0,123,255,.5)',
    },
  });
  
  const ColorButton = styled(Button)(({ theme }) => ({
    color: theme.palette.getContrastText(purple[500]),
    backgroundColor: purple[500],
    '&:hover': {
      backgroundColor: purple[700],
    },
  }));

export default function Particles() {
  const [userTokens,setUserTokens] = useState(0);
  const [tokenInstance, setTokenInstance] = useState(null);
  const [publicSaleInstance, setPublicSaleInstance] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [bnbAmount, setbnbAmount] = useState(0);
  const [web3, setWeb3] = useState(0);
  const [privateBNB, setPrivateBNB] = useState('');
  const [privateBVT, setPrivateBVT] = useState('');
  const [walletList, setWalletList] = useState([]);
  // const [provider, setProvider] = useState(null);
  const [wallet, setWallet] = useState({}); 
  const [network, setNetwork] = useState(null)
  const [onboard, setOnboard] = useState(null)
  const [notify, setNotify] = useState(null)
  const [ens, setEns] = useState(null)
  const [balance, setBalance] = useState(null)
  const [address, setAddress] = useState(null)

  
    // Web3modal instance
    const [web3Modal, setWeb3Modal] = useState(null);

    const [walletConnected, setWalletConnected] = useState(false);

    // Chosen wallet provider given by the dialog window
    let [provider, setProvider] = useState(null);
    // Address of the selected account
    let selectedAccount;
    
///////////////////////////////////////////////
function init() {
  // Count Time
  
  console.log("Initializing example");
  console.log("WalletConnectProvider is", WalletConnectProvider);
  console.log("Fortmatic is", Fortmatic);
  console.log("window.web3 is", window.web3, "window.ethereum is", window.ethereum);
  // console.log(provider);
  // Check that the web page is run in a secure context,
  // as otherwise MetaMask won't be available
  // if(window.location.protocol !== 'https:') {
  //   // https://ethereum.stackexchange.com/a/62217/620
  //   const alert = document.querySelector("#alert-error-https");
  //   alert.style.display = "block";
  //   document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
  //   return;
  // }

  // Tell Web3modal what providers we have available.
  // Built-in web browser provider (only one can exist as a time)
  // like MetaMask, Brave or Opera is added automatically by Web3modal
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        // Mikko's test key - don't copy as your mileage may vary
        infuraId: "3f88fa504c1d4ec1bec07966779f1ce0",
      }
    },

    fortmatic: {
      package: Fortmatic,
      options: {
        // Mikko's TESTNET api key
        key: "pk_test_391E26A3B43A3350"
      }
    },
        
    "custom-binancechainwallet": {
      display: {
        logo: "../assets/images/binance-logo.svg",
        name: "Binance Chain Wallet",
        description: "Connect to your Binance Chain Wallet"
      },
      package: true,
      connector: async () => {
        let provider = null;
        if (typeof window.BinanceChain !== 'undefined') {
          provider = window.BinanceChain;
          try {
            await provider.request({ method: 'eth_requestAccounts' })
          } catch (error) {
            throw new Error("User Rejected");
          }
        } else {
          throw new Error("No Binance Chain Wallet found");
        }
        return provider;
      }
    }
  };

  let web3_Modal = new Web3Modal({
    cacheProvider: false, // optional
    providerOptions, // required
    disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
  });

  setWeb3Modal(web3_Modal);

  console.log("Web3Modal instance is", web3Modal);
}

async function fetchAccountData() {

  // Get a Web3 instance for the wallet
  const web3 = new Web3(provider);
  setWeb3(web3);

  console.log("Web3 instance is", web3);

  // Get connected chain id from Ethereum node
  const chainId = await web3.eth.getChainId();
  // Load chain information over an HTTP API
  // console.log(chainId)
  // console.log(evmChains)
  // const chainData = evmChains.getChain(chainId);
  // document.querySelector("#network-name").textContent = chainData.name;

  // Get list of accounts of the connected wallet
  const accounts_temp = await web3.eth.getAccounts();
  
  const networkId_temp = web3.eth.net.getId();
  networkId_temp.then(function(networkId){
    setNetwork(networkId);
  })

  // accounts_temp.then(function(accounts){
   setAccounts(accounts_temp);

    // console.log(accounts_temp)
  // })

  const tokenInstance_temp = new web3.eth.Contract(
    BVToken.abi,
    BVToken.networks[networkId_temp] && BVToken.networks[networkId_temp].address,
  );
  tokenInstance_temp.options.address = "0xaBAf0eDE82Db96fcFee3091d11c6c35D60EF5463";
  setTokenInstance(tokenInstance_temp);

  const publicSaleInstance_temp = new web3.eth.Contract(
    PublicSale.abi,
    PublicSale.networks[networkId_temp] && PublicSale.networks[networkId_temp].address,
  );
  console.log(2)
  publicSaleInstance_temp.options.address = "0x018c09FCe2357C505c3890e15906194e3f656fB4";
  setPublicSaleInstance(publicSaleInstance_temp);
  console.log(publicSaleInstance_temp)

  // MetaMask does not give you all accounts, only the selected account
  console.log("Got accounts", accounts);
  // selectedAccount = accounts[0];

  // document.querySelector("#selected-account").textContent = selectedAccount;
  // console.log('selectedAccount', selectedAccount);

  // Get a handl
  // const template = document.querySelector("#template-balance");
  // const accountContainer = document.querySelector("#accounts");

  // Purge UI elements any previously loaded accounts
  // accountContainer.innerHTML = '';

  // Go through all accounts and get their ETH balance
  const rowResolvers = accounts_temp.map(async (address) => {
    const balance = await web3.eth.getBalance(address);
    // ethBalance is a BigNumber instance
    // https://github.com/indutny/bn.js/
    const ethBalance = web3.utils.fromWei(balance, "ether");
    const humanFriendlyBalance = parseFloat(ethBalance).toFixed(4);
    // Fill in the templated row and put in the document
    // const clone = template.content.cloneNode(true);
    // clone.querySelector(".address").textContent = address;
    // clone.querySelector(".balance").textContent = humanFriendlyBalance;
    // accountContainer.appendChild(clone);
    console.log(address);
    console.log(humanFriendlyBalance);
  });

  // Because rendering account does its own RPC commucation
  // with Ethereum node, we do not want to display any results
  // until data for all accounts is loaded
  await Promise.all(rowResolvers);
  // Display fully loaded UI for wallet data
  // document.querySelector("#prepare").style.display = "none";
  // document.querySelector("#connected").style.display = "block";
  setWalletConnected(true);
}

async function refreshAccountData() {

  // If any current data is displayed when
  // the user is switching acounts in the wallet
  // immediate hide this data
  // document.querySelector("#connected").style.display = "none";
  // document.querySelector("#prepare").style.display = "block";
  setWalletConnected(false);
  // Disable button while UI is loading.
  // fetchAccountData() will take a while as it communicates
  // with Ethereum node via JSON-RPC and loads chain data
  // over an API call.
  // document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
  await fetchAccountData(provider);
  // document.querySelector("#btn-connect").removeAttribute("disabled")
}



async function onConnect() {

  console.log("Opening a dialog", web3Modal);
  try {
    provider = await web3Modal.connect();
  } catch(e) {
    console.log("Could not get a wallet connection", e);
    return;
  }
  console.log(provider);
  setProvider(provider);
  console.log(provider);
  console.log('provider accounts changed')
  // Subscribe to accounts change
  provider.on("accountsChanged", (accounts) => {
    fetchAccountData();
  });
  console.log('provider chain changed')
  // Subscribe to chainId change
  provider.on("chainChanged", (chainId) => {
    fetchAccountData();
  });
  console.log('provider network changed')
  // Subscribe to networkId change
  provider.on("networkChanged", (networkId) => {
    fetchAccountData();
  });

  await refreshAccountData();
}

async function onDisconnect() {

  console.log("Killing the wallet connection", provider);

  // TODO: Which providers have close method?
  if(provider.close) {
    await provider.close();

    // If the cached provider is not cleared,
    // WalletConnect will default to the existing session
    // and does not allow to re-scan the QR code with a new wallet.
    // Depending on your use case you may want or want not his behavir.
    await web3Modal.clearCachedProvider();
    setProvider(null);
  }

  selectedAccount = null;

  // Set the UI back to the initial state
  // document.querySelector("#prepare").style.display = "block";
  // document.querySelector("#connected").style.display = "none";
  setWalletConnected(false);
}
///////////////////////////////////////////////




useEffect(() => {
  // const previouslySelectedWallet =
    // window.localStorage.getItem('selectedWallet')

  // if (previouslySelectedWallet && onboard) {
    // onboard.walletSelect(previouslySelectedWallet)
  // }
}, [onboard])

const updateUserTokens = async () => {
  let userTokens = await tokenInstance.methods.balanceOf(accounts[0]).call();
  setUserTokens(userTokens);
}

const listenToTokenTransfer = () => {
  if(accounts[0])
    tokenInstance.events.Transfer({to: accounts[0]}).on("data", updateUserTokens);
}

  const handlewithdrawBNB = async() => {
    if(publicSaleInstance){
      await publicSaleInstance.methods.withdrawBNB().send({from:accounts[0]});
    }
  }

  const handleGetBNBBalance = async() => {
    if(publicSaleInstance){
      const bnbfunds = await publicSaleInstance.methods.getbalance().call();
      
      setPrivateBNB(Number(bnbfunds)/10**18 + " BNB")
    }
  }

  const handleGetBVTBalance = async() => {
    if(publicSaleInstance){
      const bvtfunds = await publicSaleInstance.methods.getBVTBalance().call();
      setPrivateBVT(Number(bvtfunds)/10**18 + " BVT")
    }
  }

  const handlewithdrawBVT = async() => {
    if(publicSaleInstance){
      await publicSaleInstance.methods.withdrawBVT().send({from:accounts[0]});
    }
  }

  const getPrivateWhiteList = async ()  => {
    if(publicSaleInstance){
        const a = await publicSaleInstance.methods.getPrivateWhiteList().call();
        console.log(a);
        setWalletList(a);
    }
  }

  // useEffect(() => {
  //   if(accounts && tokenInstance && publicSaleInstance)
  //   {
  //     listenToTokenTransfer();
  //   }
  // }, [userTokens, tokenInstance, publicSaleInstance])
  
  useEffect(()=>{
    // getPets()
    init();
  },[])

    return (
      
        <div style={{height: '100vh',  backgroundImage: 'radial-gradient(50% 50%, #070086 0%, #050069 37%, #02004b 87%)'}}>
            <Container>
            
                {/* <button type="button" onClick={handleGetBNBBalance}>PublicBNB</button>
                <button type="button" onClick={handlewithdrawBNB}>withdraw BNB</button>
                <button type="button" onClick={handleGetBVTBalance}>PublicBVT</button>
                <button type="button" onClick={handlewithdrawBVT}>WithdrawBVT</button>
                <button type="button" onClick={getPrivateWhiteList}>GetWhiteList</button> */}
                <Grid
                    container
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                >
                  {!walletConnected && (
                      <Stack spacing={5} direction="row" mt={5}>
                          <BootstrapButton variant="contained" disableRipple onClick={() => {onConnect()}}>
                          Connect Wallet
                          </BootstrapButton>
                      </Stack>
                    )}
                    {walletConnected && (
                      <Stack spacing={5} direction="row" mt={5}>
                          <BootstrapButton variant="contained" disableRipple onClick={onDisconnect()}>
                          Disconnect Wallet
                          </BootstrapButton>
                      </Stack>
                    )}
                    <Stack spacing={5} direction="row" mt={2}>
                        <ColorButton variant="contained"  onClick={handleGetBNBBalance}>Private BNB</ColorButton>
                        <span className = "private-label">
                            {privateBNB}
                        </span>
                        <BootstrapButton variant="contained" disableRipple onClick={handlewithdrawBNB}>
                            Withdraw BNB
                        </BootstrapButton>
                    </Stack>
                    <Stack spacing={5} direction="row"mt={2}>
                        <ColorButton variant="contained"  onClick={handleGetBVTBalance}>Private BVT</ColorButton>
                        <span className = "private-label">
                            {privateBVT}
                        </span>
                        {/* <BootstrapButton variant="contained" disableRipple onClick={handlewithdrawBVT}>
                            Withdraw BVT
                        </BootstrapButton> */}
                    </Stack>
                    <Stack spacing={5} direction="row" mt={2}>
                        <ColorButton variant="contained"  onClick={getPrivateWhiteList} color="success">Get WhiteList</ColorButton>
                    </Stack>
                    <Stack spacing={5} direction="row" mt={2}>
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                <TableHead>
                                <TableRow>
                                    <TableCell>Address</TableCell>
                                </TableRow>
                                </TableHead>
                                <TableBody>
                                {walletList.map((address, key) => (
                                    <TableRow
                                        key={key}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                    <TableCell component="th" scope="row">
                                        {address}
                                    </TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Stack>
                </Grid>
            </Container>
        </div>
      
    );
  }
  