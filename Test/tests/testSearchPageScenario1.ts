import "dotenv/config";
import SearchPage from "../pages/SearchPage1";

fixture`Search page1 verification`.page(`${process.env.TEST_URL}`);

test("Search page1 different verifications", async (t: TestController) => {
  const Searchpage = new SearchPage();
  await Searchpage.verifySearchByBuffer(t);
});
 