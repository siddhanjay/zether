const Web3 = require("web3");
const {Qtum} = require('qtumjs');
const Client = require("../anonymous.js/src/client.js");
const ZSC = require("../contract-artifacts/artifacts/ZSC.json");
const Deployer = require('./deployer.js');
const Provider = require('./provider.js');
const ZSC_contract_data = require('./../contract-artifacts/artifacts/ZSC_solar.json');
const CashToken_contract_data  = require("./../contract-artifacts/artifacts/CashToken_solar.json");
const ZetherVerifier_contract_data = require("./../contract-artifacts/artifacts/ZetherVerifier_solar.json");


// Initialize the client, use deposit and withdraw functions, add friend nodes and perform anonymous transfer
// Ensure that the contracts ZSC,ZetherVerifier and CashToken are already deployed using solar
(async () => {

    // Initilaize connection with Qtum RPC
    const ZSC_qtum = new Qtum("http://hello:hello@localhost:13889",ZSC_contract_data);
    const ZetherVerifier_qtum = new Qtum("http://hello:hello@localhost:13889",ZetherVerifier_contract_data);
    const CashToken_qtum =  new Qtum("http://hello:hello@localhost:13889",CashToken_contract_data);

    // Get contract data
    const ZSC_contract = ZSC_qtum.contract("softwares/zether/packages/protocol/contracts/ZSC.sol");
    const ZetherVerifier_contract = ZetherVerifier_qtum.contract("softwares/zether/packages/protocol/contracts/ZetherVerifier.sol");
    const CashToken_contract = CashToken_qtum.contract("softwares/zether/packages/protocol/contracts/CashToken.sol");

 //   web3.transactionConfirmationBlocks = 1;
    var deployer = new Deployer();

    //const zether_address = (await deployer.deployZetherVerifier()).contractAddress;
    //const cash = (await deployer.deployCashToken()).contractAddress;
    await deployer.mintCashToken(CashToken_contract);
   // const zsc = (await deployer.deployZSC(cash, zether, 6)).contractAddress; // epoch length in seconds.
    await deployer.approveCashToken(CashToken_contract.address, ZSC_contract.address);
    const deployed = new web3.eth.Contract(ZSC.abi, zsc);

    const accounts = await web3.eth.getAccounts();
    const client = new Client(deployed, accounts[0], web3);
    await client.initialize();
    await client.deposit(10000);
    await client.withdraw(1000);
    client.friends.add("Alice", ['0x0eaadaaa84784811271240ec2f03b464015082426aa13a46a99a56c964a5c7cc', '0x173ce032ad098e9fcbf813696da92328257e58827f3600b259c42e52ff809433']);
    await client.transfer('Alice', 1000);
})().catch(console.error);