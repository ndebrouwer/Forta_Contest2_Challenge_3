
const ethers = require("ethers");
const { Finding, FindingSeverity, FindingType } = require("forta-agent");
const ABI = require('./ABI');
const polygon_endpoint = "https://speedy-nodes-nyc.moralis.io/05d6234c01fcc15a42584fc9/polygon/mainnet";
const polygon_provider = new ethers.providers.JsonRpcProvider(polygon_endpoint);
const PolygonPriceOracle = new ethers.Contract(
    ABI.polygon_priceoracle_addr,
    ABI.PRICEORACLE_ABI,
    polygon_provider);

module.exports = {
 polygon_endpoint, polygon_provider,PolygonPriceOracle,

}