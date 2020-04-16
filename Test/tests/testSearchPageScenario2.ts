import "dotenv/config";
import SearchPage from "../pages/SearchPage2";

fixture`Search page2 verification`.page(`${process.env.TEST_URL}`);

test("Search page2 different verifications", async (t: TestController) => {
  const Searchpage = new SearchPage();
  await Searchpage.verifySearchbyShapePlusBuffer(t);
});

 