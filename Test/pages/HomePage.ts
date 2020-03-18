import { Selector } from "testcafe";
import { buildingAddressData } from "../helpers/searchData";

export default class HomePage {
  pageTitle: Selector = Selector("[class='app-title']");
  citylinkButton: Selector = Selector("a[href='https://www.phila.gov']");
  howtouseButton: Selector = Selector(".app-footer:nth-child(4) .cell div")
  closeHowtouseButton: Selector = Selector("svg[data-icon='times-circle']");
  feedbackButton: Selector = Selector(".app-footer:nth-child(4) li:nth-child(3) > a");
  searchMap: Selector = Selector("input[placeholder='Search the map']");
  searchmapButton: Selector = Selector("svg[data-icon= 'search']");
  table: Selector = Selector('table');
  mailingLables: Selector = Selector("a[class='button mailing pvc-export-data-button']");
  downloadCSV: Selector = Selector("a[class='button csv pvc-export-data-button']");

    // Verify page landing
  public verifyPageFunctionality = async (t: TestController) => {
    await t.expect(this.pageTitle.visible).ok();
    await t.expect(this.feedbackButton.visible).ok();
    await t.expect(this.citylinkButton.visible).ok();
    await t.click(this.howtouseButton);
    await t.click(this.closeHowtouseButton);
    await t.typeText(this.searchMap,  buildingAddressData.address);
    await t.click(this.searchmapButton);
    await t.click(this.downloadCSV);
    await t.click(this.mailingLables);
    await t.wait(2000);
    const tableValues = await this.table.innerText;
    await t.expect(tableValues).contains(buildingAddressData.opaAddress)
    var tablecount = await this.table.count;
    for (var i=0; i < tablecount; i++)
    await t.click(this.table.nth(i))
    await t.expect(tableValues).contains(buildingAddressData.opaAddress);
   
  }
}
