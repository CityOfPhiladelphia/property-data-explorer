import { Selector } from "testcafe";
import { testSearchData } from "../helpers/searchData";

export default class HomePage {
  pageTitle: Selector = Selector("[class='app-title']");
  citylinkButton: Selector = Selector(".app-footer:nth-child(4) li:nth-child(1) > a");
  howtouseButton: Selector = Selector(".app-footer:nth-child(4) .cell div");
  closeHowtouseButton: Selector = Selector("svg[data-icon='times-circle']");
  feedbackButton: Selector = Selector(".app-footer:nth-child(4) li:nth-child(3) > a"); 
  searchMap: Selector = Selector("input[placeholder='Search the map']");
  searchmapButton: Selector = Selector("button[name='pvm-search-control-button']");
  table: Selector = Selector('table');
  mailingLables: Selector = Selector("svg[data-icon='download']");
  downloadCSV: Selector = Selector("svg[data-icon='envelope']");
  btnAddUnitresults: Selector = Selector("a[class='topic-component']");
  tableRowCount: Selector = Selector('table tr');

    // Verify page landing
  public verifyPageFunctionality = async (t: TestController) => {
    await t.wait(20000);
    await t.expect(this.pageTitle.visible).ok();
    await t.expect(this.feedbackButton.visible).ok();
    await t.expect(this.citylinkButton.visible).ok();
    await t.click(this.howtouseButton);
    await t.click(this.closeHowtouseButton);
    await t.typeText(this.searchMap,  testSearchData.address);
    await t.click(this.searchmapButton);
    await t.wait(20000);
    await t.click(this.downloadCSV);
    await t.click(this.mailingLables);
    await t.wait(20000);
    const tableValues = await this.table.innerText;
    await t.expect(tableValues).contains(testSearchData.address)
   
  }

}
