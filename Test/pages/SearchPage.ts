import { Selector } from "testcafe";
import "dotenv/config";
import { testSearchData } from "../helpers/searchData";

export default class SearchPage {
  searchMap: Selector = Selector("input[placeholder='Search the map']");
  searchmapButton: Selector = Selector("button[name='pvm-search-control-button']")
  mailingLables: Selector = Selector("svg[data-icon='download']");
  downloadCSV: Selector = Selector("svg[data-icon='envelope']");
  table: Selector = Selector('table');
  propCardAddress: Selector = Selector("h1[class='address-header-line-1'");
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

  public verifySearchByCondoAddress = async (t: TestController) => {
    await t.typeText(this.searchMap, testSearchData.condoAddress1);
    await t.click(this.searchmapButton);
    await t.wait(20000);
    const tableValues = await this.table.innerText;
    await t.expect(tableValues).contains(testSearchData.condoAddress1)
    await t.click(this.btnAddUnitresults);
    await t.wait(20000);
    const tableRowcount = await this.tableRowCount.count;
    await t.expect(tableRowcount).eql(271);
    const tablerowValues = await this.table.innerText;
    await t.expect(tablerowValues).contains(testSearchData.condoAddressverify)
    await t.click(this.downloadCSV);
    await t.click(this.mailingLables);
  }
  public verifySearchByCondoAddress2 = async (t: TestController) => {
    await t.typeText(this.searchMap, testSearchData.condoAddress2);
    await t.click(this.searchmapButton);
    await t.wait(20000);
    const tableValues = await this.table.innerText;
    await t.click(this.btnAddUnitresults.with({ visibilityCheck: true }));
    await t.wait(20000);
    const tableRowcount = await this.tableRowCount.count;
    await t.expect(tableRowcount).eql(235);
    const tablerowValues = await this.table.innerText;
    await t.expect(tableValues).contains(testSearchData.condoAddress2)
    await t.expect(tablerowValues).contains(testSearchData.condoAddressverify2)
  }

  public verifySearchByBlock = async (t: TestController) => {
    await t.navigateTo(`${process.env.TEST_URL}`);
    await t.typeText(this.searchMap, testSearchData.blockSearch);
    await t.click(this.searchmapButton);
    await t.wait(20000);
    const propCardAddress = await this.propCardAddress.innerText;
    await t.expect(propCardAddress).contains(testSearchData.blockSearchValue);
  }
  public verifyMultResultsAddressSearch = async (t: TestController) => {
    await t.navigateTo(`${process.env.TEST_URL}`);
    await t.typeText(this.searchMap, testSearchData.twoResultsSearch);
    await t.click(this.searchmapButton);
    await t.wait(20000);
    const tableRowcount = await this.tableRowCount.count;
    await t.expect(tableRowcount).eql(2);
  }

  public verifySearchByBuffer = async (t: TestController) => {
    await t.navigateTo(`${process.env.TEST_URL}`);
    await t.click(this.btnBuffer.with({ visibilityCheck: true }));  
    await t.wait(20000);
    await t.click('#map')
    await t.wait(20000);
    const tableBuffervalues = await this.table.innerText;
    await t.expect(tableBuffervalues).contains(testSearchData.tablePolygontextVerify);
    await t.click(this.btnAddUnitresults);
  }
  public verifySearchbyShapePlusBuffer = async (t: TestController) => {
    await t.navigateTo(`${process.env.TEST_URL}`);
    await t.click(this.polygonSearch);
    await t.wait(20000);
    await t.expect(this.finishIcon.visible).ok();
    // await t.expect(this.deleteIcon.visible).ok();
    await t.expect(this.cancelIcon.visible).ok();
    await t.wait(20000);
    await t.click('#map', { offsetX: 250, offsetY: 250 })
    await t.wait(20000);
    await t.click('#map', { offsetX: 250, offsetY: 200 })
    await t.wait(20000);
    await t.click('#map', { offsetX: 310, offsetY: 100 })
    await t.wait(20000);
    await t.click('#map', { offsetX: 250, offsetY: 250 })
    await t.wait(20000);
    const tablePolySearchValues = this.table.innerText
    await t.expect(tablePolySearchValues).contains(testSearchData.tablePolygontextVerify);
    await t.click(this.btnBuffer);
    await t.click('#map')
    await t.wait(20000);
    const tableBufferSearchValues = this.table.innerText
    await t.expect(tableBufferSearchValues).contains(testSearchData.polyaddress);

  }

  public verifySearchByAddressPlusBuffer = async (t: TestController) => {
    await t.selectText(this.searchMap).pressKey('delete');
    await t.typeText(this.searchMap, testSearchData.addressBuffer);
    await t.click(this.searchmapButton);
    await t.wait(20000);
    const tableAddressValues = await this.table.innerText;
    await t.expect(tableAddressValues).contains(testSearchData.addressBuffer)
    await t.click(this.btnBuffer);
    await t.wait(20000);
    await t.click('#map');
    await t.wait(20000);
    const tableBufferValues = await this.table.innerText;
    await t.expect(tableBufferValues).contains(testSearchData.addressBuffer);
    await t.expect(tableBufferValues).contains(testSearchData.addressBufferVerify);
    await t.click(this.btnAddUnitresults);
  }
  public verifySearchByOPAplusBufferplusShape = async (t: TestController) => {
    await t.navigateTo(`${process.env.TEST_URL}`);
    await t.typeText(this.searchMap, testSearchData.opaAccountValue);
    await t.click(this.searchmapButton);
    await t.wait(20000);
    const tableOPAValues = await this.table.innerText;
    await t.expect(tableOPAValues).contains(testSearchData.address)
    await t.wait(20000)
    await t.click(this.btnBuffer);
    await t.click('#map')
    await t.wait(20000);
    const tableBufferSearchValues = this.table.innerText
    await t.expect(tableBufferSearchValues).contains(testSearchData.address);
    await t.wait(20000);
    await t.click(this.polygonSearch);
    await t.click('#map', { offsetX: 550, offsetY: 150 })
    await t.wait(1000);
    await t.click('#map', { offsetX: 650, offsetY: 150 })
    await t.wait(2000);
    await t.click('#map', { offsetX: 600, offsetY: 200 })
    await t.wait(2000);
    await t.click('#map', { offsetX: 550, offsetY: 150 })
    await t.wait(2000);
    const tableOPAShapeValues = await this.table.innerText;
    await t.expect(tableOPAShapeValues).ok();
  }
  public verifySearchByAddressplusShape = async (t: TestController) => {
    await t.navigateTo(`${process.env.TEST_URL}`);
    await t.typeText(this.searchMap, testSearchData.addressBufferVerify);
    await t.click(this.searchmapButton);
    await t.wait(3000);
    const tableAddresValues = await this.table.innerText;
    await t.expect(tableAddresValues).contains(testSearchData.addressBufferVerify)
    await t.wait(2000);
    await t.click(this.polygonSearch);
    await t.click('#map', { offsetX: 550, offsetY: 150 })
    await t.wait(2000);
    await t.click('#map', { offsetX: 600, offsetY: 150 })
    await t.wait(2000);
    await t.click('#map', { offsetX: 500, offsetY: 200 })
    await t.wait(2000);
    await t.click('#map', { offsetX: 550, offsetY: 150 })
    await t.wait(3000);
    const tableOPAShapeAddressValues = await this.table.innerText;
    await t.expect(tableOPAShapeAddressValues).ok();
  }
}
