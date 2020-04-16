import { Selector } from "testcafe";
import "dotenv/config";
import { testSearchData } from "../helpers/searchData";

export default class SearchPage {
  searchMap: Selector = Selector("input[placeholder='Search the map']");
  searchmapButton: Selector = Selector("button[name='pvm-search-control-button']")
  mailingLables: Selector = Selector("svg[data-icon='download']");
  downloadCSV: Selector = Selector("svg[data-icon='envelope']");
  table: Selector = Selector("table").with({ visibilityCheck: true });
  tableRowCount: Selector = Selector('table tr').with({ visibilityCheck: true });
  polygonSearch: Selector = Selector(".leaflet-draw-draw-polygon");
  finishIcon: Selector = Selector(".leaflet-draw-actions > li:nth-child(1) > a");
  deleteIcon: Selector = Selector(".leaflet-draw-actions > li:nth-child(2) > a");
  cancelIcon: Selector = Selector(".leaflet-draw-actions > li:nth-child(3) > a");
  map: Selector = Selector("#map");
  leafletdrawIcon1: Selector = Selector(".leaflet-marker-icon:nth-child(6)");
  btnAddUnitresults: Selector = Selector("a[class='topic-component button condo-button clicked-false']");
  btnBuffer: Selector = Selector("button[class='inactive pointer']");
  btnZoomIn: Selector = Selector("a[title='Zoom in']");

  public verifySearchByCondoAddress = async (t: TestController) => {
    await t.typeText(this.searchMap, testSearchData.condoAddress1);
    await t.click(this.searchmapButton);
    await t.expect(this.mailingLables.visible).ok();
    await t.expect(this.downloadCSV.visible).ok();
    await t.wait(5000);
    const tableSelected = await this.table;
    const tableValues = await tableSelected.textContent;
    await t.expect(tableValues).contains(testSearchData.condoAddress1)
    await t.click(this.btnAddUnitresults);
    await t.wait(4000);
    const tableRowcounts = await this.tableRowCount;
    const tableRowcount = await tableRowcounts.count;
    await t.expect(tableRowcount).eql(271);
    const tableSelected1 = await this.table;
    const tablerowValues = await tableSelected1 .innerText;
    await t.expect(tablerowValues).contains(testSearchData.condoAddressverify)
  }
  public verifySearchByAddressplusOwner = async (t: TestController) => {
    await t.navigateTo(`${process.env.TEST_URL}`);
    await t.typeText(this.searchMap, testSearchData.AddressOwner);
    await t.click(this.searchmapButton);
    await t.wait(5000);
    await t.expect(this.mailingLables.visible).ok();
    const tableSelected = await this.table;
    const tableOwnerValues = await tableSelected.innerText;
    await t.expect(tableOwnerValues).contains(testSearchData.addressBuffer);

  }
}