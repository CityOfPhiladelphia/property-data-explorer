class SearchData {
  public address: string;
  public opaAddress: string;
  public opaAccount: string;
  public opaAddressValue: string;
  public opaAccountValue: string;
  public parcelId: string;
  public parcelDescription: string;

  constructor(parameters: SearchData = {} as SearchData) {
    const {
      address,
      opaAddress,
      opaAccount,
      opaAccountValue,
      opaAddressValue,
      parcelId,
      parcelDescription,
    } = parameters;

    this.address = address as string;
    this.opaAddress = opaAddress as string;
    this.opaAccount = opaAccount as string;
    this.opaAccountValue = opaAccountValue as string;
    this.opaAddressValue = opaAddressValue as string;
    this.parcelId = parcelId as string;
    this.parcelDescription = parcelDescription as string;
  }
}

// enter the search data of Market Address.
export const buildingAddressData: SearchData = {
  address: "1234 Market St",
  opaAddress: "OPA Address",
  opaAccount: "OPA Account #",
  opaAccountValue: "883309050",
  opaAddressValue: "1234 MARKET ST",
  parcelId: "001S070144",
  parcelDescription:
    "CMX-5CMX-5Center City Core Commercial Mixed-UseCenter City Core Commercial Mixed-Use",
};

