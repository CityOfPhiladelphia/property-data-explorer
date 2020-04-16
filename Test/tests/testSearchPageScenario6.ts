import "dotenv/config";
import SearchPage from "../pages/SearchPage6";

fixture`Search page6 verification`.page(`${process.env.TEST_URL}`);

test("Search page different verifications", async (t: TestController) => {
  const Searchpage = new SearchPage();
  await Searchpage.verifySearchByOwnerplusShape(t);
});
 