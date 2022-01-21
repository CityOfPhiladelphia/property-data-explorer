import { Selector, ClientFunction } from "testcafe";
import "dotenv/config";
import { testSearchData } from "../helpers/searchData";


export default class Sequence {
    searchMap: Selector = Selector("input[placeholder='Search the map']");
    searchmapButton: Selector = Selector("button[name='pvm-search-control-button']")
    clearButton: Selector = Selector("button[name='pvm-search-control-button']").prevSibling(1);
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
    
    public verifySearchBySequence = async (t: TestController) => {
        // Block Search
        await t.navigateTo(`${process.env.TEST_URL}`);
        await t.typeText(this.searchMap, testSearchData.blockSearch);
        await t.click(this.searchmapButton);
        await t.wait(5000);
        const propCardAddress = await this.propCardAddress.innerText;
        await t.expect(propCardAddress).contains(testSearchData.blockSearchValue);
        // Two Results Address Search
        await t.navigateTo(`${process.env.TEST_URL}`);
        await t.typeText(this.searchMap, testSearchData.twoResultsSearch);
        await t.click(this.searchmapButton);
        await t.wait(5000);
        const tableRowcount = await this.tableRowCount.count;
        await t.expect(tableRowcount).eql(3);
        // Condo Search, Load, and Download
        await t.click(this.clearButton);
        await t.typeText(this.searchMap, testSearchData.condoAddress1);
        await t.click(this.searchmapButton);
        await t.wait(5000);
        const tableValues = await this.table.innerText;
        await t.expect(tableValues).contains(testSearchData.condoAddress1)
        await t.click(this.btnAddUnitresults);
        await t.wait(4000);
        const tableRowcount2 = await this.tableRowCount.count;
        await t.expect(tableRowcount2).eql(271);
        const tablerowValues = await this.table.innerText;
        await t.expect(tablerowValues).contains(testSearchData.condoAddressverify)
        await t.click(this.downloadCSV);
        await t.click(this.mailingLables);
        //Test browser back button
        const goBack = ClientFunction(() => window.history.back());
        await goBack();
        await t.wait(4000);
        const tableRowcount3 = await this.tableRowCount.count;
        await t.expect(tableRowcount3).eql(3);
        await t.click(this.downloadCSV);
        await t.wait(4000);
    }
}