const Web3 = require("web3");
const {Qtum,QtumRPC} = require('qtumjs');
const ZetherVerifier = require("../contract-artifacts/artifacts/ZetherVerifier.json");
const BurnVerifier = require("../contract-artifacts/artifacts/BurnVerifier.json");
const CashToken = require("../contract-artifacts/artifacts/CashToken.json");
const ZSC = require("../contract-artifacts/artifacts/ZSC.json");
const ZSC_contract_data = require('./../contract-artifacts/artifacts/ZSC_solar.json');
const CashToken_contract_data  = require("./../contract-artifacts/artifacts/CashToken_solar.json");
const ZetherVerifier_contract_data = require("./../contract-artifacts/artifacts/ZetherVerifier_solar.json");

class Deployer {
    constructor() {
        const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:13889"));
        const rpc = new QtumRPC('http://hello:hello@localhost:13889');
        const senderAddress = 'qTpsU6JtGroSphv2GfYR6xFGZ7YTqY89JB';
        const senderAddressHex = toHexAddress(senderAddress);
        web3.transactionConfirmationBlocks = 1;

        // this.deployZetherVerifier = () => {
        //     const abi = ZetherVerifier.abi;
        //     const bytecode = ZetherVerifier.bytecode;
        //     const contract = new web3.eth.Contract(abi);
        //     return new Promise((resolve, reject) => {
        //         contract
        //             .deploy({
        //                 data: bytecode
        //             })
        //             .send({
        //                 from: "0xed9d02e382b34818e88b88a309c7fe71e65f419d",
        //                 gas: 470000000
        //             })
        //             .on("error", (err) => {
        //                 reject(err);
        //             })
        //             .on("receipt", (receipt) => {
        //                 console.log("Zether verifier mined (address = \"" + receipt.contractAddress + "\").");
        //                 resolve(receipt);
        //             });
        //     });
        // };

        // this.deployBurnVerifier = () => {
        //     const abi = BurnVerifier.abi;
        //     const bytecode = BurnVerifier.bytecode;
        //     const contract = new web3.eth.Contract(abi);
        //     return new Promise((resolve, reject) => {
        //         contract.deploy({
        //                 data: bytecode
        //             })
        //             .send({
        //                 from: "0xed9d02e382b34818e88b88a309c7fe71e65f419d",
        //                 gas: 470000000
        //             })
        //             .on("error", (err) => {
        //                 reject(err);
        //             })
        //             .on("receipt", (receipt) => {
        //                 console.log("Burn verifier mined (address = \"" + receipt.contractAddress + "\").");
        //                 resolve(receipt);
        //             });
        //     });
        // };

        // this.deployCashToken = () => {
        //     const abi = CashToken_contract_data.abi;
        //     const bytecode = CashToken_contract_data.bytecode;
        //     const contract = new web3.eth.Contract(abi);
        //     return new Promise((resolve, reject) => {
        //         contract
        //             .deploy({
        //                 data: bytecode
        //             })
        //             .send({
        //                 from: "0xed9d02e382b34818e88b88a309c7fe71e65f419d",
        //                 gas: 470000000
        //             })
        //             .on("error", (err) => {
        //                 reject(err);
        //             })
        //             .on("receipt", (receipt) => {
        //                 console.log("ERC20 contact mined (address = \"" + receipt.contractAddress + "\").");
        //                 resolve(receipt);
        //             });
        //     });
        // };


        this.mintCashToken = async (contract) => {
            const addr = contract.address;
            const abi = contract.info.abi;
            const ercContract = web3.eth.Contract(abi, addr);
            try{
                const result  = await contract.send("mint",[senderAddressHex, 1000000]);
                console.log(result);
            } catch(err){
                console.log(err);
            }

            // return new Promise((resolve, reject) => {
            //     contract.send("mint",[senderAddressHex, 1000000]) // hardcoded address?
            //         .send({
            //             from: "qTpsU6JtGroSphv2GfYR6xFGZ7YTqY89JB",
            //             gas: 470000000
            //         })
            //         .on("error", (err) => {
            //             reject(err);
            //         })
            //         .on("receipt", (receipt) => {
            //             ercContract.methods.balanceOf("0xed9d02e382b34818e88B88a309c7fe71E65f419d").call()
            //                 .then(balance => {
            //                     console.log("ERC20 funds minted (balance = " + balance + ").");
            //                     resolve(receipt);
            //                 });
            //         });
            // });
        };

        this.approveCashToken = (contractAddress, zscAddress) => {
            const abi = CashToken.abi;
            const ercContract = web3.eth.Contract(abi, contractAddress);
            return new Promise((resolve, reject) => {
                ercContract.methods.approve(zscAddress, 1000000)
                    .send({
                        from: "0xed9d02e382b34818e88b88a309c7fe71e65f419d",
                        gas: 470000000
                    })
                    .on("error", (err) => {
                        reject(err);
                    })
                    .on("receipt", (receipt) => {
                        ercContract.methods.allowance("0xed9d02e382b34818e88B88a309c7fe71E65f419d", zscAddress).call()
                            .then(allowance => {
                                console.log("ERC funds approved for transfer to ZSC (allowance = " + allowance + ").");
                                resolve(receipt);
                            });
                    });
            });
        };

       

        this.deployZSC = (cash, zether, epochLength) => {
            const abi = ZSC.abi;
            const bytecode = ZSC.bytecode;
            const contract = new web3.eth.Contract(abi);
            return new Promise((resolve, reject) => {
                contract
                    .deploy({
                        data: bytecode,
                        arguments: [cash, zether, epochLength]
                    })
                    .send({
                        from: "0xed9d02e382b34818e88b88a309c7fe71e65f419d",
                        gas: 470000000
                    })
                    .on("error", (err) => {
                        reject(err);
                    })
                    .on("receipt", (receipt) => {
                        console.log("ZSC main contract deployed (address = \"" + receipt.contractAddress + "\").");
                        resolve(receipt);
                    });
            });
        };

         // Converts a base58 pubkeyhash address to a hex address
         async function toHexAddress(base58_address) {
            const hexAddr = await rpc.rawCall("gethexaddress",[base58_address]);
            return hexAddr;
        };
        

    };
    
    
    
}


module.exports = Deployer;