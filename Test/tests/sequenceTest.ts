import "dotenv/config";
import Sequence from "../pages/Sequence";

fixture`Sequence verification`.page(`${process.env.TEST_URL}`);

test("Sequence verifications", async (t: TestController) => {
  const sequence = new Sequence();
  await sequence.verifySearchBySequence(t);
});
 