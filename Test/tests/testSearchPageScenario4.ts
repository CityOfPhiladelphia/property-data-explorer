import "dotenv/config";
import SearchPage from "../pages/SearchPage4";

fixture`Search page4 verification`.page(`${process.env.TEST_URL}`);

test("Search page4 different verifications", async (t: TestController) => {
  const Searchpage = new SearchPage();
  await Searchpage.verifySearchByOPAplusBufferplusShape(t);
});

 