class SearchData {
  public address: string;
  public blockSearch: string;
  public blockSearchValue: string;
  public twoResultsSearch: string;
  public oneCondo: string;
  public oneCondoAddress: string;
  public opaAddress: string;
  public opaAccount: string;
  public opaAddressValue: string;
  public opaAccountValue: string;
  public parcelId: string;
  public AddressOwner: string;
  public condoAddress1: string;
  public condoAddressverify: string;
  public condoAddress2: string;
  public condoAddressverify2: string;
  public tablePolygontextVerify: string;
  public addressBuffer: string;
  public addressBufferVerify: string;
  public polyaddress: string;
  constructor(parameters: SearchData = {} as SearchData) {
    const {
      address,
      blockSearch,
      blockSearchValue,
      twoResultsSearch,
      opaAddress,
      opaAccount,
      opaAccountValue,
      opaAddressValue,
      parcelId,
      AddressOwner,
      condoAddress1,
      condoAddressverify,
      condoAddress2,
      condoAddressverify2,
      tablePolygontextVerify,
      addressBuffer,
      addressBufferVerify,
      polyaddress,
    } = parameters;

    this.address = address as string;
    this.blockSearch = blockSearch as string;
    this.blockSearchValue = blockSearchValue as string;
    this.twoResultsSearch = twoResultsSearch as string;
    this.opaAddress = opaAddress as string;
    this.opaAccount = opaAccount as string;
    this.opaAccountValue = opaAccountValue as string;
    this.opaAddressValue = opaAddressValue as string;
    this.parcelId = parcelId as string;
    this.AddressOwner = AddressOwner as string;
    this.condoAddress1 = condoAddress1 as string;
    this.condoAddressverify = condoAddressverify as string;
    this.condoAddress2 = condoAddress2 as string;
    this.condoAddressverify2 = condoAddressverify as string;
    this.tablePolygontextVerify = tablePolygontextVerify as string;
    this.addressBuffer = addressBuffer as string;
    this.addressBufferVerify = addressBufferVerify as string;
    this.polyaddress = polyaddress as string;
  }
}

// enter the search data of Market Address.
export const testSearchData: SearchData = {
  address: "1234 Market St",
  blockSearch: "Block: 1400 JOHN F KENNEDY BLVD",
  blockSearchValue: "1400 JOHN F KENNEDY BLVD",
  twoResultsSearch: "1111 Herbert St",
  opaAddress: "Street Address",
  opaAccount: "OPA Account #",
  opaAccountValue: "883309050",
  opaAddressValue: "1234 MARKET ST",
  parcelId: "001S070144",
  AddressOwner: "1931 Pine st BONOVITZ SHELDON JILL F ",
  condoAddress1: "1414 S Penn Sq",
  condoAddressverify: "1414 S Penn Sq Unit 11a",
  condoAddress2: "220 Locust St",
  condoAddressverify2: "220 Locust St # 5hs",
  tablePolygontextVerify: "1400 John F Kennedy Blvd",
  addressBuffer: "1931 Pine St",
  addressBufferVerify: "1918 Delancey Pl",
  polyaddress: "1315 Market St",
  oneCondo: "",
  oneCondoAddress: ""
};
