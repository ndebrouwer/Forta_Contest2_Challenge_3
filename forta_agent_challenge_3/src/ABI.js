const main_priceoracle_addr = "0xa50ba011c48153de246e5192c8f9258a2ba79ca9";
const amm_priceoracle_addr = main_priceoracle_addr;
const polygon_priceoracle_addr = "0x0229F777B0fAb107F9591a41d5F02E4e98dB6f2d"
const avalanche_priceoracle_addr = "0xdC336Cd4769f4cC7E9d726DA53e6d3fC710cEB89"
const DAI_address = "0x6b175474e89094c44da98b954eedeac495271d0f";
const USDC_address = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const PRICEORACLE_ABI = [
  "function getAssetPrice(address asset) public override view returns (uint256)",
];
//hardcoded reserve list for all markets

module.exports = {
PRICEORACLE_ABI, 
main_priceoracle_addr, amm_priceoracle_addr, polygon_priceoracle_addr, avalanche_priceoracle_addr,
DAI_address, USDC_address
}
