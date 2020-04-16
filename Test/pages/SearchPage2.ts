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
  
  public verifySearchbyShapePlusBuffer = async (t: TestController) => {
    // await t.navigateTo(`${process.env.TEST_URL}`);
    await t.click(this.polygonSearch);
    await t.expect(this.finishIcon.visible).ok();
    await t.expect(this.deleteIcon.visible).ok();
    await t.expect(this.cancelIcon.visible).ok();
    await t.wait(1000);
    await t.click('#map', { offsetX: 150, offsetY: 150 })
    await t.wait(1000);
    await t.click('#map', { offsetX: 150, offsetY: 100 })
    await t.wait(1000);
    await t.click('#map', { offsetX: 310, offsetY: 100 })
    await t.wait(1000);
    await t.click('#map', { offsetX: 150, offsetY: 150 })
    await t.wait(3000);
    const tablePolySearchValues = this.table.innerText
    await t.expect(tablePolySearchValues).contains(testSearchData.tablePolygontextVerify);
    await t.click(this.btnBuffer);
    await t.click('#map', { offsetX: 350, offsetY: 200 })
    await t.wait(3000);
    const tableBufferSearchValues = this.table.innerText
    await t.expect(tableBufferSearchValues).contains(testSearchData.tablePolygontextVerify);

  }

}
