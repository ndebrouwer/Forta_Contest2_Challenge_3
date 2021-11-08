ethers = require("ethers");
const { Finding, FindingSeverity, FindingType } = require("forta-agent");
const ABI = require('./ABI');
/* 
   
*/
//'https://mainnet.infura.io/v3/625e9f003d984473bfed3e343c72b684'
const avalanche_endpoint = "https://speedy-nodes-nyc.moralis.io/05d6234c01fcc15a42584fc9/avalanche/mainnet";
const avalanche_provider = new ethers.providers.JsonRpcProvider(avalanche_endpoint);
const AvalanchePriceOracle = new ethers.Contract(
    ABI.avalanche_priceoracle_addr,
    ABI.PRICEORACLE_ABI,
    avalanche_provider);

module.exports = {
    avalanche_endpoint,avalanche_provider,AvalanchePriceOracle,
}
