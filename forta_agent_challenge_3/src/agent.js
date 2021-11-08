
const ethers = require("ethers");
const { Finding, FindingSeverity, FindingType,getJsonRpcUrl } = require("forta-agent");
const polygonOracle = require("./polygonOracle");
const avalancheOracle = require("./avalancheOracle");
const ABI = require('./ABI');
/* 
    Regarding polygon and avalanche oracles
    as of the fallbackOracle is not actually set for either the polygon or the 
    avalanche oracles, hence they are not included in this script and those networks/markets
    are not supported, however, there is a polygonOracle and avalancheOracle modules 
  
*/
//const mainnet_endpoint = 'https://mainnet.infura.io/v3/625e9f003d984473bfed3e343c72b684'
//once you have other network endpoints push your endpoints into endpoints[] so code works
var endpoints = [];
const provider = new ethers.providers.JsonRpcProvider(getJsonRpcUrl());
const PolygonPriceOracle = polygonOracle.PolygonPriceOracle;
const AvalanchePriceOracle = avalancheOracle.AvalanchePriceOracle;
const MainPriceOracle = new ethers.Contract(
  ABI.main_priceoracle_addr,
  ABI.PRICEORACLE_ABI,
  provider);
var prev_exchange_rate = 1;
const getAssetPrice = async (oracle, asset_address) => {
  let price =  await oracle.getAssetPrice(asset_address);
  console.log(price);
  let _price = ethers.utils.formatEther(new ethers.BigNumber.from(price._hex).toString());
  console.log(_price, "logging _price");
  return _price;
}

const oracleByNetwork = (blockEvent) => {
  if(blockEvent.network.toLowerCase() === "polygon")
  {
    return PolygonPriceOracle;
  }
  if(blockEvent.network.toLowerCase() === "mainnet"){
    return MainPriceOracle;
  }
  if(blockEvent.network.toLowerCase() === "avalanche"){
    return AvalanchePriceOracle;
  }
  if(blockEvent.network.toLowerCase() === '1'){
    return MainPriceOracle;
  }
}
const oracleFxn = async (oracle) => {
  let findings = [];
  //time_now = Date.now();
  let DAI_price = await getAssetPrice(oracle,ABI.DAI_address);
  let USDC_price = await getAssetPrice(oracle,ABI.USDC_address);
  console.log(DAI_price);
  console.log(USDC_price);
  let exchange_rate = parseFloat(DAI_price)/parseFloat(USDC_price );
  console.log(exchange_rate, "printing exchange rate");
  if(exchange_rate < prev_exchange_rate)
  {
    console.log("DAI/USDC exchange rate alert");
    findings.push(
      Finding.fromObject({
        name: "AAVE-3",
        description: "DAI/USDC exchange rate dropped ",
        alertId: "AAVE-3",
        severity: FindingSeverity.Medium,
        type: FindingType.Suspicious,
        metadata:{
          USDCprice: USDC_price,
          DAIprice: DAI_price 
        }
      })
    );
  }
  prev_exchange_rate = exchange_rate;


  //console.log(time_now-Date.now());
  return findings;
}

const handleBlock = async (blockEvent) => {
  const findings = [];
  
  let oracle = oracleByNetwork(blockEvent);
  findings.concat(await oracleFxn(oracle) );

  return findings;
};

module.exports = {
  //handleTransaction,
  handleBlock,
};
