import "dotenv/config";
import SearchPage from "../pages/SearchPage";

fixture`Search page verification`.page(`${process.env.TEST_URL}`);

test("Search page different verifications", async (t: TestController) => {
  const Searchpage = new SearchPage();
  // Test moved to sequence.ts
  // await Searchpage.verifySearchByCondoAddress(t);
  await Searchpage.verifySearchByCondoAddress2(t);
  // Test moved to sequence.ts
  // await Searchpage.verifySearchByBlock(t);
  // await Searchpage.oneCondoBuilding(t);
  // Test moved to sequence.ts
  // await Searchpage.verifyMultResultsAddressSearch(t);
  await Searchpage.verifySearchByBuffer(t);
  await Searchpage.verifySearchbyShapePlusBuffer(t);
  await Searchpage.verifySearchByAddressPlusBuffer(t);
  await Searchpage.verifySearchByOPAplusBufferplusShape(t);
  await Searchpage.verifySearchByAddressplusShape(t);
});
 
