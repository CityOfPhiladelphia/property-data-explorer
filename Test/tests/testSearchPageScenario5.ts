import "dotenv/config";
import SearchPage from "../pages/SearchPage5";

fixture`Search page5 verification`.page(`${process.env.TEST_URL}`);

test("Search page5 different verifications", async (t: TestController) => {
  const Searchpage = new SearchPage();
  await Searchpage.verifySearchByAddressplusShape(t);
});
 
 