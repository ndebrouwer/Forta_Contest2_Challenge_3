const ethers = require("ethers");
const { Finding, FindingSeverity, FindingType } = require("forta-agent");
const ABI = require('./ABI');
/* 
    Regarding polygon and avalanche oracles
    as of the fallbackOracle is not actually set for either the polygon or the 
    avalanche oracles, hence they are not included in this script and those networks/markets
    are not supported, however, there is a polygonOracle and avalancheOracle modules 
  
*/
//'https://mainnet.infura.io/v3/625e9f003d984473bfed3e343c72b684'
const mainnet_endpoint = 'https://mainnet.infura.io/v3/625e9f003d984473bfed3e343c72b684'
//once you have other network endpoints push your endpoints into endpoints[] so code works
var endpoints = [];
const provider = new ethers.providers.JsonRpcProvider(mainnet_endpoint);

const lp_addr_main = "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9";
const lp_addr_amm = "0x7937D4799803FbBe595ed57278Bc4cA21f3bFfCB";
const lp_addr_polygon = "0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf";
const lp_addr_avalanche = "0x4F01AeD16D97E3aB5ab2B501154DC9bb0F1A5A2C";

var LP_ABI = ["function getReservesList() external view returns (address[] memory)"]
const Main_LendingPool = new ethers.Contract(lp_addr_main, LP_ABI, provider);
const AMM_LendingPool = new ethers.Contract(lp_addr_amm, LP_ABI, provider);
const MainPriceOracle = new ethers.Contract(
  ABI.main_priceoracle_addr,
  ABI.PRICEORACLE_ABI,
  provider);

var ReservesListMain = [];
var ReservesListAMM = [];
var fallbackOracle_addr = [];
var assetPrices = new Map(); //key: (asset address, price)
var bool_initialized = false;

const initiateReserveLists = async () => {
  ReservesListMain = await Main_LendingPool.getReservesList();
  ReservesListAMM = await AMM_LendingPool.getReservesList();
  //possibly not necessary since UNI assets are not currently supported so its mostly 
  //just stables on the AMM market
  //done to consolidate MainPriceOracles list of assets to call since UNI assets are on eth anyways
  ReservesListAMM.filter(reserve => {
    if (!(ReservesListMain.includes(reserve))) {
      console.log(reserve, "printing reserves");
      ReservesListMain = Object.assign([], ReservesListMain);
      ReservesListMain.push(reserve);

    }

  });
  console.log(ReservesListMain);
  ReservesListMain.forEach(reserve => {
    assetPrices.set(reserve, 0);
  });
}
const initiateFallbackOracle_addr = async () => {
  fallbackOracle_addr.push(await MainPriceOracle.getFallbackOracle());
  return (fallbackOracle_addr.length != 0);
}

const getAssetPrices = async (oracle, assetPriceMap) => {
  let prices = await oracle.getAssetsPrices(ReservesListMain);
  let _prices = [];
  let assetPriceMapKeys = assetPriceMap.keys();
  let priceFilter = (price) => {
    let _price = ethers.utils.formatEther(new ethers.BigNumber.from(price._hex).toString());
    assetPriceMap.set(assetPriceMapKeys.next().value, _price);
    return _price;
  };
  _prices = prices.forEach(priceFilter);
  console.log(assetPriceMap);
  return _prices;
}
const initialize = async () => {
  console.log("initializing agent...")
  await initiateReserveLists();
  let bool_check = await initiateFallbackOracle_addr();
  await getAssetPrices(MainPriceOracle, assetPrices);
  return (bool_check && (ReservesListMain.length != 0));
}
const getSourceOfAsset = async (oracle, asset_address) => {
  return await oracle.getSourceOfAsset(asset_address);
  
}
const oracleFxn = async (oracle, assetPriceMap) => {
  let findings = [];
  let prevAssetPrices = assetPrices;
  
  //time_now = Date.now();
  //let oracleAddress = await getSourceOfAsset(oracle, ReservesListMain[0]);
  if (true) {
    await getAssetPrices(MainPriceOracle, assetPrices);
    console.log(assetPrices,prevAssetPrices);
    assetPrices.forEach((key) => {
      if(parseFloat(assetPrices.get(key)) < .9*parseFloat(prevAssetPrices.get(key)) ){
        console.log("Asset: ",key," had a large price deviation");
        findings.push(
          Finding.fromObject({
            name: "fallbackOracle price deviation",
            description: "Fallback Oracle called and returned a large price deviation",
            alertId: "",
            severity: FindingSeverity.Medium,
            type: FindingType.Suspicious,
          })
        );
      }

    })

  }
  //console.log(time_now-Date.now());
  return findings;
}
const test = async () => {

  if(bool_initialized==false){
    bool_initialized=await initialize();
    await oracleFxn(MainPriceOracle,assetPrices);
  }
}
test();