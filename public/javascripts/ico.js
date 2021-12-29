
$(document).ready(function () {

  const ethereumButton = document.querySelector('.connectToMetaMask');

  const basicPlanBtn = document.querySelector('.basic-plan');
  const plusPlanBtn = document.querySelector('.plus-plan');
  const visionaryPlanBtn = document.querySelector('.visionary-plan');

  ethereumButton.addEventListener('click', (event) => {
    connectToAnotherAccount(ethereumButton)
  })

  ICO.init();
  connectToWallet(ethereumButton)

  // listen event in Infura
  // var provider = new Web3.providers.WebsocketProvider("");
  // var web3Infura = new Web3(provider);
  // var tokenSaleContractInfura = new web3Infura.eth.Contract(ICO.worTokenSaleContractAbi, ICO.worTokenSaleContractAddr);
  // // console.log(tokenSaleContractInfura)
  // tokenSaleContractInfura.events.Sell({ filter: {}, fromBlock: "latest" }, function (err, event) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     console.log(event)
  //     $("#tableList").append(`
  //       <tr class="rowTable">
  //         <td>`+ event.returnValues[0] + `</td>
  //         <td>`+ event.returnValues[1] + `</td>
  //       </tr>
  //     `)
  //   }
  // });

  basicPlanBtn.addEventListener('click', (event) => {
    ICO.basicPlan(event);
  });
  plusPlanBtn.addEventListener('click', (event) => {
    ICO.plusPlan(event);
  });
  visionaryPlanBtn.addEventListener('click', (event) => {
    ICO.visionaryPlan(event);
  });

});

async function connectToWallet(ethereumButton) {

  // Detect the MetaMask Ethereum provider
  const provider = await detectEthereumProvider();

  if (provider) {
    startApp(provider); // Initialize your app
  } else {
    console.log('Please install MetaMask!');
  }

  function startApp(provider) {
    // If the provider returned by detectEthereumProvider is not the same as
    // window.ethereum, something is overwriting it, perhaps another wallet.
    if (provider !== window.ethereum) {
      console.error('Do you have multiple wallets installed?');
    }
    // Access the decentralized web!
  }

  // Handle chain (network) and chainChanged (per EIP-1193) 
  ethereum.on('chainChanged', (chainId) => {
    window.location.reload();
  });

  // Handle user accounts and accountsChanged (per EIP-1193)
  ethereum
    .request({ method: 'eth_accounts' })
    .then(handleAccountsChanged)
    .catch((err) => {
      // Some unexpected error.
      // For backwards compatibility reasons, if no accounts are available,
      // eth_accounts will return an empty array.
      console.error(err);
    });

  // Note that this event is emitted on page load.
  // If the array of accounts is non-empty, you're already
  // connected.
  ethereum.on('accountsChanged', handleAccountsChanged);

  // For now, 'eth_accounts' will continue to always return an array
  function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      console.log('Please connect to MetaMask.');
    } else if (accounts[0] !== ICO.currentAccount) {
      ICO.currentAccount = accounts[0];
      // console.log("In func: " + ICO.currentAccount)
      document.querySelector('.showAccount').innerHTML = "Your account: " + ICO.currentAccount;

      // console.log(ICO.currentAccount);
      $('#after-connected').show();
      $('#intro-price').hide();
      if (ICO.currentAccount != "") {
        ICO.contracts.worTokenContract.methods.balanceOf(ICO.currentAccount).call().then(function (_balance) {
          // console.log(_balance)
          // currentBalance = _balance.toNumber();
          $('.wor-balance').html(_balance);
        })
      }
    }
  }

  ethereumButton.addEventListener('click', connect)

  function connect() {
    ethereum
      .request({ method: 'eth_requestAccounts' })
      .then(handleAccountsChanged)
      .catch((err) => {
        if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          console.log('Please connect to MetaMask.');
        } else {
          console.error(err);
        }
      });
  };

  ethereum.on('disconnect', () => {
    $('#after-connected').hide();
    $('#intro-price').show();
  });

};

async function connectToAnotherAccount(ethereumButton) {
  ICO.currentAccount = "";

  const accounts = await window.ethereum.request({
    method: "wallet_requestPermissions",
    params: [{
      eth_accounts: {}
    }]
  }).then(() => ethereum.request({
    method: 'eth_requestAccounts'
  }))

  // console.log(accounts[0])
  ICO.currentAccount = accounts[0]
};

ICO = {
  worTokenSaleContractAbi: [
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
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_value",
          "type": "uint256"
        }
      ],
      "name": "Withdraw",
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
    },
    {
      "constant": false,
      "inputs": [],
      "name": "withdraw",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
  worTokenSaleContractAddr: "0x5380bbAf10f886D38c3b33E9B90d835599C44CD3",

  worTokenContractAbi: [
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_initialSupply",
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
          "indexed": true,
          "internalType": "address",
          "name": "_owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "_spender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_value",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "_burner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_value",
          "type": "uint256"
        }
      ],
      "name": "Burn",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "_oldOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "_newOwner",
          "type": "address"
        }
      ],
      "name": "OwnerSet",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "_from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "_to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_value",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "constant": true,
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "allowance",
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
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "balanceOf",
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
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "standard",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "totalSupply",
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
      "name": "transferable",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "getOwner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
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
          "internalType": "address",
          "name": "_newOwner",
          "type": "address"
        }
      ],
      "name": "changeOwner",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "bool",
          "name": "_choice",
          "type": "bool"
        }
      ],
      "name": "isTransferable",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "address",
          "name": "_to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_value",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "internalType": "bool",
          "name": "success",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "address",
          "name": "_spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_value",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "internalType": "bool",
          "name": "success",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "address",
          "name": "_from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_value",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [
        {
          "internalType": "bool",
          "name": "success",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_value",
          "type": "uint256"
        }
      ],
      "name": "burn",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
  worTokenContractAddr: "0x6DCb6b24459DF0f197203C1a7A9390CB39a6F718",

  contracts: {},
  tokenPrice: 1000000000000000,
  tokensSold: 0,
  tokensAvailable: 10000000,
  admin: "",
  currentAccount: "",
  currentBalance: 0,

  init: function () {
    console.log("App initialized...");
    // let web3 = new Web3('http://localhost:8545');
    let web3 = new Web3(window.ethereum);
    ICO.contracts.tokenSaleContract = new web3.eth.Contract(ICO.worTokenSaleContractAbi, ICO.worTokenSaleContractAddr);
    ICO.contracts.worTokenContract = new web3.eth.Contract(ICO.worTokenContractAbi, ICO.worTokenContractAddr);

    ICO.contracts.worTokenContract.methods.getOwner().call().then(function (owner) {
      console.log("Admin: "+owner);
      ICO.admin = owner;
    })

    ICO.contracts.tokenSaleContract.methods.tokenPrice().call().then(function (_tokenPrice) {
      ICO.tokenPrice = _tokenPrice;
      $('.token-price').html(web3.utils.fromWei(ICO.tokenPrice, 'ether'));
    });

    ICO.contracts.tokenSaleContract.methods.tokensSold().call().then(function (_tokenSold) {
      // console.log(_tokenSold);
      $('.tokens-sold').html(_tokenSold);
      $('.tokens-available').html(ICO.tokensAvailable);
    });

  },

  buyTokens: function (event) {
    // $('#content').hide();
    // $('#loader').show();
    var numberOfTokens = $('#numberOfTokens').val();
    console.log("Quantity: " + numberOfTokens);
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

  basicPlan: function (event) {
    if (ICO.currentAccount.length === 0) {
      event.preventDefault();
      alert('Please connect to MetaMask');
    } else {
      event.preventDefault();
      ICO.contracts.worTokenContract.methods.transfer(ICO.admin, 1).send({
        from: ICO.currentAccount
      }).then((result) => {
        console.log("Successfully registered for basic plan");
        ICO.contracts.worTokenContract.methods.balanceOf(ICO.currentAccount).call().then(function (_balance) {
          $('.wor-balance').html(_balance);
        })
      }).catch((error) => {
        console.log("Error...");
      });
    }
  },

  plusPlan: function (event) {
    if (ICO.currentAccount.length === 0) {
      event.preventDefault();
      alert('Please connect to MetaMask');
    } else {
      event.preventDefault();
      ICO.contracts.worTokenContract.methods.transfer(ICO.admin, 3).send({
        from: ICO.currentAccount
      }).then((result) => {
        console.log("Successfully registered for plus plan");
        ICO.contracts.worTokenContract.methods.balanceOf(ICO.currentAccount).call().then(function (_balance) {
          $('.wor-balance').html(_balance);
        })
      }).catch((error) => {
        console.log("Error...");
      });
    }
  },
  visionaryPlan: function (event) {
    if (ICO.currentAccount.length === 0) {
      event.preventDefault();
      alert('Please connect to MetaMask');
    } else {
      event.preventDefault();
      ICO.contracts.worTokenContract.methods.transfer(ICO.admin, 5).send({
        from: ICO.currentAccount
      }).then((result) => {
        console.log("Successfully registered for visionary plan");
        ICO.contracts.worTokenContract.methods.balanceOf(ICO.currentAccount).call().then(function (_balance) {
          $('.wor-balance').html(_balance);
        })
      }).catch((error) => {
        console.log("Error...");
      });
    }
  },
}