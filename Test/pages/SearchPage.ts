import {  ClientFunction, Selector } from "testcafe";
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
    await t.click('#map', { offsetX: 150, offsetY: 150 })
    await t.wait(1000);
    await t.click('#map', { offsetX: 150, offsetY: 250 })
    await t.wait(1000);
    await t.click('#map', { offsetX: 250, offsetY: 150 })
    await t.wait(1000);
    await t.click('#map', { offsetX: 150, offsetY: 150 })
    await t.wait(4000);

  }
}




