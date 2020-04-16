import { Selector } from "testcafe";
import "dotenv/config";
import { testSearchData } from "../helpers/searchData";

export default class SearchPage {
  searchMap: Selector = Selector("input[placeholder='Search the map']");
  searchmapButton: Selector = Selector("button[name='pvm-search-control-button']")
  mailingLables: Selector = Selector("svg[data-icon='download']");
  downloadCSV: Selector = Selector("svg[data-icon='envelope']");
  table: Selector = Selector("table").with({ visibilityCheck: true });
  tableRowCount: Selector = Selector('table tr');
  polygonSearch: Selector = Selector(".leaflet-draw-draw-polygon");
  finishIcon: Selector = Selector(".leaflet-draw-actions > li:nth-child(1) > a");
  deleteIcon: Selector = Selector(".leaflet-draw-actions > li:nth-child(2) > a");
  cancelIcon: Selector = Selector(".leaflet-draw-actions > li:nth-child(3) > a");
  map: Selector = Selector("#map");
  leafletdrawIcon1: Selector = Selector(".leaflet-marker-icon:nth-child(6)");
  btnAddUnitresults: Selector = Selector("a[class='topic-component button condo-button clicked-false']");
  btnBuffer: Selector = Selector("button[class='inactive pointer']");
  btnZoomIn: Selector = Selector("a[title='Zoom in']");
 
  public verifySearchByAddressPlusBuffer = async (t: TestController) => {
    //await t.selectText(this.searchMap).pressKey('delete');
    await t.typeText(this.searchMap, testSearchData.addressBuffer);
    await t.click(this.searchmapButton);
    await t.wait(3000);
    const tableAddressValues = await this.table.innerText;
    await t.expect(tableAddressValues).contains(testSearchData.addressBuffer)
    await t.click(this.btnBuffer);
    await t.click('#map');
    await t.wait(3000);
    const tableBufferValues = await this.table.innerText;
    await t.expect(tableBufferValues).contains(testSearchData.addressBuffer);
    await t.expect(tableBufferValues).contains(testSearchData.addressBufferVerify);
    await t.click(this.btnAddUnitresults);
  }
}