import "dotenv/config";
import SearchPage from "../pages/SearchPage";

fixture`Search page verification`.page(`${process.env.TEST_URL}`);

test("Search page different verifications", async (t: TestController) => {
  const Searchpage = new SearchPage();
  await Searchpage.verifySearchByCondoAddress(t);
  await Searchpage.verifySearchByBuffer(t);
  await Searchpage.verifySearchbyShapePlusBuffer(t);
  await Searchpage.verifySearchByAddressPlusBuffer(t);
  await Searchpage.verifySearchByOPAplusBufferplusShape(t);
  await Searchpage.verifySearchByAddressplusShape(t);
});
 
