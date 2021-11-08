const {
  FindingType,
  FindingSeverity,
  Finding,
  createBlockEvent,
} = require("forta-agent");
const { handleBlock } = require("./agent");

describe("DAI/USDC agent", () => {
  const createBlockEventExchangeRate = () =>
    createBlockEvent();

  describe("handleBlock", () => {
    it("returns empty findings if DAI/USDC is normal", async () => {
      const blockEvent = createBlockEvent();

      const findings = await handleBlock(blockEvent);

      expect(findings).toStrictEqual([]);
    });

    it("returns a finding if gas used is above threshold", async () => {
      const blockEvent = createBlockEventExchangeRate();

      const findings = await handleBlock(blockEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: "AAVE-3",
            description: "DAI/USDC exchange rate dropped",
            alertId: "AAVE-3",
            severity: FindingSeverity.Medium,
            type: FindingType.Suspicious,
            metadata:{
              USDCprice: USDC_price,
              DAIprice: DAI_price 
            }
        }),
      ]);
    });
  });
});
