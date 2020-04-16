import "dotenv/config";
import SearchPage from "../pages/SearchPage3";

fixture`Search page3 verification`.page(`${process.env.TEST_URL}`);

test("Search page3 different verifications", async (t: TestController) => {
  const Searchpage = new SearchPage();
  await Searchpage.verifySearchByAddressPlusBuffer(t);
});
 