import { Selector } from "testcafe";
import "dotenv/config";
import { testSearchData } from "../helpers/searchData";

export default class SearchPage {
  searchMap: Selector = Selector("input[placeholder='Search the map']");
  searchmapButton: Selector = Selector("button[name='pvm-search-control-button']")
  mailingLables: Selector = Selector("svg[data-icon='download']");
  downloadCSV: Selector = Selector("svg[data-icon='envelope']");
  table: Selector = Selector('table');
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

  public verifySearchByAddressplusShape = async (t: TestController) => {
    //await t.navigateTo(`${process.env.TEST_URL}`);
    await t.wait(2000);
    await t.typeText(this.searchMap, testSearchData.addressBufferVerify);
    await t.click(this.searchmapButton);
    await t.wait(3000);
    const tableAddresValues = await this.table.innerText;
    await t.expect(tableAddresValues).contains(testSearchData.addressBufferVerify)
    await t.wait(2000);
    await t.click(this.polygonSearch);
    await t.click('#map', { offsetX: 450, offsetY: 150 })
    await t.wait(1000);
    await t.click('#map', { offsetX: 550, offsetY: 250 })
    await t.wait(2000);
    await t.click('#map', { offsetX: 600, offsetY: 200 })
    await t.wait(2000);
    await t.click('#map', { offsetX: 750, offsetY: 130 })
    await t.wait(3000);
    await t.click('#map', { offsetX: 450, offsetY: 150 })
    await t.wait(3000);
    const tableOPAShapeAddressValues = await this.table.innerText;
    await t.expect(tableOPAShapeAddressValues).contains(testSearchData.addressBufferVerify);

  }
  
}
