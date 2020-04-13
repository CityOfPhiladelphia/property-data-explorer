import { Selector } from "testcafe";
import "dotenv/config";
import { testSearchData } from "../helpers/searchData";

export default class SearchPage {
  searchMap: Selector = Selector("input[placeholder='Search the map']");
  searchmapButton: Selector = Selector(".pvm-search-control-button");
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

  public verifySearchByCondoAddress = async (t: TestController) => {
    await t.typeText(this.searchMap, testSearchData.condoAddress1);
    await t.click(this.searchmapButton);
    await t.wait(5000);
    const tableValues = await this.table.innerText;
    await t.expect(tableValues).contains(testSearchData.condoAddress1)
    await t.click(this.btnAddUnitresults);
    await t.wait(4000);
    const tableRowcount = await this.tableRowCount.count;
    await t.expect(tableRowcount).eql(271);
    const tablerowValues = await this.table.innerText;
    await t.expect(tablerowValues).contains(testSearchData.condoAddressverify)
  }

  public verifySearchByBuffer = async (t: TestController) => {
    await t.navigateTo(`${process.env.TEST_URL}`);
    await t.click(this.btnBuffer);
    await t.click('#map');
    await t.wait(4000);
    const tableBuffervalues = await this.table.innerText;
    await t.expect(tableBuffervalues).contains(testSearchData.tablePolygontextVerify);
    await t.click(this.btnAddUnitresults);
  }
  public verifySearchbyShapePlusBuffer = async (t: TestController) => {
    await t.navigateTo(`${process.env.TEST_URL}`);
    await t.click(this.polygonSearch);
    await t.expect(this.finishIcon.visible).ok();
    await t.expect(this.deleteIcon.visible).ok();
    await t.expect(this.cancelIcon.visible).ok();
    await t.wait(1000);
    await t.click('#map', { offsetX: 150, offsetY: 150 })
    await t.wait(1000);
    await t.click('#map', { offsetX: 150, offsetY: 250 })
    await t.wait(1000);
    await t.click('#map', { offsetX: 250, offsetY: 150 })
    await t.wait(1000);
    await t.click('#map', { offsetX: 150, offsetY: 150 })
    await t.wait(4000);
    const tablePolySearchValues = this.table.innerText
    await t.expect(tablePolySearchValues).contains(testSearchData.tablePolygontextVerify);
    await t.click(this.btnBuffer);
    await t.click('#map', { offsetX: 350, offsetY: 200 })
    await t.wait(4000);
    const tableBufferSearchValues = this.table.innerText
    await t.expect(tableBufferSearchValues).contains(testSearchData.tablePolygontextVerify);

  }

  public verifySearchByAddressPlusBuffer = async (t: TestController) => {
    await t.selectText(this.searchMap).pressKey('delete');
    await t.typeText(this.searchMap, testSearchData.addressBuffer);
    await t.click(this.searchmapButton);
    await t.wait(3000);
    const tableValues = await this.table.innerText;
    await t.expect(tableValues).contains(testSearchData.addressBuffer)
    await t.click(this.btnBuffer);
    await t.click('#map');
    await t.wait(4000);
    const tableBufferValues = await this.table.innerText;
    await t.expect(tableBufferValues).contains(testSearchData.addressBuffer);
    await t.expect(tableBufferValues).contains(testSearchData.addressBufferVerify);
    await t.click(this.btnAddUnitresults);
  }
  public verifySearchByOPAplusBufferplusShape = async (t: TestController) => {
    await t.navigateTo(`${process.env.TEST_URL}`);
    await t.typeText(this.searchMap, testSearchData.opaAccountValue);
    await t.click(this.searchmapButton);
    await t.wait(2000);
    const tableOPAValues = await this.table.innerText;
    await t.expect(tableOPAValues).contains(testSearchData.address)
    await t.wait(3000)
    await t.click(this.btnBuffer);
    await t.click('#map')
    await t.wait(4000);
    const tableBufferSearchValues = this.table.innerText
    await t.expect(tableBufferSearchValues).contains(testSearchData.address);
    await t.wait(2000);
    await t.click(this.polygonSearch);
    await t.click('#map', { offsetX: 450, offsetY: 150 })
    await t.wait(1000);
    await t.click('#map', { offsetX: 550, offsetY: 250 })
    await t.wait(1000);
    await t.click('#map', { offsetX: 650, offsetY: 200 })
    await t.wait(1000);
    await t.click('#map', { offsetX: 450, offsetY: 150 })
    await t.wait(4000);
    const tableOPAShapeValues = await this.table.innerText;
    await t.expect(tableOPAShapeValues).contains(testSearchData.address);
  }
  public verifySearchByAddressplusOwner = async (t: TestController) => {
    await t.navigateTo(`${process.env.TEST_URL}`);
    await t.typeText(this.searchMap, testSearchData.AddressOwner);
    await t.click(this.searchmapButton);
    await t.wait(2000);
    const tableOwnerValues = await this.table.innerText;
    await t.expect(tableOwnerValues).contains(testSearchData.addressBuffer);

  }
  public verifySearchByAddressplusShape = async (t: TestController) => {
    await t.navigateTo(`${process.env.TEST_URL}`);
    await t.typeText(this.searchMap, testSearchData.addressBufferVerify);
    await t.click(this.searchmapButton);
    await t.wait(3000);
    const tableValues = await this.table.innerText;
    await t.expect(tableValues).contains(testSearchData.addressBufferVerify)
    await t.wait(2000);
    await t.click(this.polygonSearch);
    await t.click('#map', { offsetX: 450, offsetY: 150 })
    await t.wait(1000);
    await t.click('#map', { offsetX: 550, offsetY: 250 })
    await t.wait(1000);
    await t.click('#map', { offsetX: 600, offsetY: 200 })
    await t.wait(1000);
    await t.click('#map', { offsetX: 750, offsetY: 200 })
    await t.wait(1000);
    await t.click('#map', { offsetX: 450, offsetY: 150 })
    await t.wait(4000);
    const tableOPAShapeValues = await this.table.innerText;
    await t.expect(tableOPAShapeValues).contains(testSearchData.addressBufferVerify);

  }
  public verifySearchByOwnerplusShape = async (t: TestController) => {
    await t.navigateTo(`${process.env.TEST_URL}`);
    await t.typeText(this.searchMap, testSearchData.owner);
    await t.click(this.searchmapButton);
    await t.wait(2000);
    const tableOwnerShapeValues = await this.table.innerText;
    await t.expect(tableOwnerShapeValues).contains(testSearchData.owner);

  }
  
}