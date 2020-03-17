import {  Selector } from "testcafe";
import { buildingAddressData } from "../helpers/searchData";

export default class SearchPage {
  searchMap: Selector = Selector("input[placeholder='Search the map']");
  searchmapButton: Selector = Selector("svg[data-icon= 'search']");
  polygonSearch: Selector = Selector(".leaflet-draw-draw-polygon");
  finishIcon: Selector = Selector(".leaflet-draw-actions > li:nth-child(1) > a");
  deleteIcon: Selector = Selector(".leaflet-draw-actions > li:nth-child(2) > a");
  cancelIcon: Selector = Selector(".leaflet-draw-actions > li:nth-child(3) > a");
  map: Selector = Selector("#map");
  leafletdrawIcon1: Selector = Selector(".leaflet-marker-icon:nth-child(6)");
  
 
  public verifySearchbyPolygon = async (t: TestController) => {
    await t.click( this.polygonSearch);
    await t.expect(this.finishIcon.visible).ok();
    await t.expect(this.deleteIcon.visible).ok();
    await t.expect(this.cancelIcon.visible).ok();
    await t.wait(1000);
    await t.drag( this.polygonSearch, 10, 10, { offsetX: 5, offsetY: 5 });
    await t.click(this.map);
    await t.wait(2000);
    await t.hover(this.map);
    await t.click(this.map);
    await t.wait(2000);
    await t.drag( this.polygonSearch, 40, 50, { offsetX: 15, offsetY: 15 });
    await t.click(this.map);
    await t.wait(2000);
    await t.click(this.finishIcon);
  }
}
