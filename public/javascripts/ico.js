
$(document).ready(function () {
    var web3Provider = null;
    console.log(ICO.currentAccount.length === 0);

    if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask is installed!');
    } else {
        console.log('MetaMask not installed!');
    }

    const ethereumButton = document.querySelector('.connectToMetaMask');
    const showAccount = document.querySelector('.showAccount');

    ethereumButton.addEventListener('click', () => {
        getAccount().then((accounts) => {
            ICO.currentAccount = accounts[0];
            console.log(ICO.currentAccount);
            showAccount.innerHTML = "Your account: " + ICO.currentAccount;
        }).catch((err) => {
            console.log(err);
        });
    });

    // if (window.ethereum) {
    //     web3Provider = window.ethereum;
    // } else {
    //     web3Provider = 'http://localhost:8545';
    // }
    // web3 = new Web3(web3Provider);
    ICO.init();
    // let web3 = new Web3('http://localhost:8545');
    // let web3 = new Web3(window.ethereum);

    // var contractIco = new web3.eth.Contract(ICO.abi, ICO.worTokenSale);

    // console.log(contractIco);

    // $("#buyToken").click(function () {
    //     if (currentAccount.length === 0) {
    //         alert('Please connect to MetaMask');
    //     }
    // })

});

async function getAccount() {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    return accounts;
}

ICO = {
    abi: [
        {
          "inputs": [
            {
              "internalType": "contract WorToken",
              "name": "_tokenContract",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "_tokenPrice",
              "type": "uint256"
            }
          ],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "_totalAmountSold",
              "type": "uint256"
            }
          ],
          "name": "EndSale",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "address",
              "name": "_buyer",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "_amount",
              "type": "uint256"
            }
          ],
          "name": "Sell",
          "type": "event"
        },
        {
          "constant": true,
          "inputs": [],
          "name": "tokenContract",
          "outputs": [
            {
              "internalType": "contract WorToken",
              "name": "",
              "type": "address"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [],
          "name": "tokenPrice",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [],
          "name": "tokensSold",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_numberOfTokens",
              "type": "uint256"
            }
          ],
          "name": "buyTokens",
          "outputs": [],
          "payable": true,
          "stateMutability": "payable",
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [],
          "name": "endSale",
          "outputs": [],
          "payable": false,
          "stateMutability": "nonpayable",
          "type": "function"
        }
    ],
    worTokenSale: "0x163C1596257ac1A67b146aF58CCdBAb4Aa3aB37d",
    contracts: {},
    loading: false,
    tokenPrice: 1000000000000000,
    tokensSold: 0,
    tokensAvailable: 10000000,
    currentAccount: "",

    init: function(){
        console.log("App initialized...");
        let web3 = new Web3('http://localhost:8545');
        ICO.contracts.tokenSaleContract = new web3.eth.Contract(ICO.abi, ICO.worTokenSale);
        console.log(ICO.currentAccount);
    },

    buyTokens: function (event) {
        // $('#content').hide();
        // $('#loader').show();
        var numberOfTokens = $('#numberOfTokens').val();
        console.log(numberOfTokens);
        // event.preventDefault();
        if (ICO.currentAccount.length === 0) {
            event.preventDefault();
            alert('Please connect to MetaMask');
        } else {
            event.preventDefault();
            ICO.contracts.tokenSaleContract.methods.buyTokens(numberOfTokens).send({
                from: ICO.currentAccount,
                value: numberOfTokens * ICO.tokenPrice,
                gas: 500000
            }).then((eve) => {
                console.log("Tokens bought...");
            }).catch((eve) => {
                console.log("Error...");
            });

        }
    },
}