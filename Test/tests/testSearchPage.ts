import "dotenv/config";
import SearchPage from "../pages/SearchPage";

fixture`Search page verification`.page(`${process.env.TEST_URL}`);

test("Search page polygon search verification", async (t: TestController) => {
  const Searchpage = new SearchPage();
  await Searchpage.verifySearchbyPolygon(t);
});
