export const STOCKS = `ABB.ST ALFA.ST ALIV-SDB.ST ASSA-B.ST ATCO-A.ST ATCO-B.ST AZN.ST BOL.ST ELUX-B.ST ERIC-B.ST ESSITY-B.ST EVO.ST
GETI-B.ST HEXA-B.ST HM-B.ST INVE-B.ST KINV-B.ST NDA-SE.ST NIBE-B.ST SAND.ST SBB-B.ST SCA-B.ST SEB-A.ST SHB-A.ST SKA-B.ST SKF-B.ST
SWED-A.ST TEL2-B.ST TELIA.ST VOLV-B.ST ADDT-B.ST AAK.ST AXFO.ST BALD-B.ST BEIJ-B.ST CAST.ST EPI-A.ST EQT.ST FABG.ST HUSQ-B.ST
INDU-C.ST INDT.ST INTRUM.ST LATO-B.ST LIFCO-B.ST LUND-B.ST SAAB-B.ST SAGA-B.ST SECU-B.ST SINCH.ST SSAB-B.ST SWEC-B.ST TREL-B.ST
VITR.ST WALL-B.ST WIHL.ST HOLM-B.ST HUFV-A.ST LUG.ST MTRS.ST NCC-B.ST PEAB-B.ST SOBI.ST STE-R.ST THULE.ST AFRY.ST CAMX.ST
BILL.ST BRAV.ST BURE.ST DOM.ST ENGCON-B.ST HPOL-B.ST KNOW.ST MYCR.ST NOLA-B.ST PNDX-B.ST SKIS-B.ST SECT-B.ST VOLCAR-B.ST AZA.ST
SAVE.ST EMBRAC-B.ST STOR-B.ST BOOZT.ST LOOMIS.ST ATRLJ-B.ST CLAS-B.ST NEWA-B.ST INWI.ST ARJO-B.ST HMS.ST BIOA-B.ST BETS-B.ST
TOBII.ST SDIP-B.ST XVIVO.ST VBG-B.ST AAPL MSFT NVDA TSLA AMZN GOOGL META SPOT NFLX AMD NOVO-B.CO EQNR.OL`
  .split(/\s+/)
  .filter(Boolean);

export const ETFS = ["XACT-OMXS30.ST", "IUSQ.DE", "EUNL.DE", "SXR8.DE", "QDVE.DE", "VWCE.DE"];

export const INDICES: [string, string, "INDEX" | "CURRENCY" | "COMMODITY" | "CRYPTO", string][] = [
  ["^OMX", "OMX Stockholm 30", "INDEX", "OMXS30"],
  ["^OMXSPI", "OMX Stockholm PI", "INDEX", "OMXSPI"],
  ["^OMXC25", "OMX Copenhagen 25", "INDEX", "OMXC25"],
  ["^OMXH25", "OMX Helsinki 25", "INDEX", "OMXH25"],
  ["OBX.OL", "Oslo Børs OBX", "INDEX", "OBX"],
  ["^GDAXI", "DAX", "INDEX", "DAX"],
  ["^FTSE", "FTSE 100", "INDEX", "FTSE 100"],
  ["^GSPC", "S&P 500", "INDEX", "S&P 500"],
  ["^IXIC", "Nasdaq Composite", "INDEX", "NASDAQ"],
  ["^DJI", "Dow Jones", "INDEX", "DJIA"],
  ["^N225", "Nikkei 225", "INDEX", "NIKKEI"],
  ["USDSEK=X", "USD/SEK", "CURRENCY", "USD/SEK"],
  ["EURSEK=X", "EUR/SEK", "CURRENCY", "EUR/SEK"],
  ["NOKSEK=X", "NOK/SEK", "CURRENCY", "NOK/SEK"],
  ["DKKSEK=X", "DKK/SEK", "CURRENCY", "DKK/SEK"],
  ["GC=F", "Guld", "COMMODITY", "GULD"],
  ["BZ=F", "Olja (Brent)", "COMMODITY", "BRENT"],
  ["BTC-USD", "Bitcoin", "CRYPTO", "BTC"],
];

// symbol, category, risk (SRI 1–7, indicative), fallback fee %, company
export const FUNDS: [string, string, number, number, string][] = [
  ["0P0001F3XT.ST", "Globalfond (index)", 4, 0.4, "Handelsbanken Fonder"],
  ["0P00001DF8.ST", "Sverigefond (index)", 5, 0.4, "Handelsbanken Fonder"],
  ["0P0000TXY1.ST", "USA-fond (index)", 5, 0.4, "Handelsbanken Fonder"],
  ["0P00000L33.ST", "Globalfond", 4, 0.4, "AMF Fonder"],
  ["0P00000LST.ST", "Globalfond (index)", 4, 0.2, "Storebrand"],
  ["0P0001KOKT.ST", "Globalfond (index)", 4, 0.2, "Swedbank Robur"],
  ["0P00000LDD.ST", "Globalfond", 4, 1.25, "Swedbank Robur"],
  ["0P00000LCG.ST", "Teknikfond", 6, 1.25, "Swedbank Robur"],
  ["0P00000K48.ST", "Teknikfond", 6, 1.25, "Swedbank Robur"],
  ["0P0001Q6FG.ST", "Teknikfond", 6, 0.8, "DNB"],
  ["0P0000ULAP.ST", "Sverigefond", 5, 0.2, "Spiltan Fonder"],
  ["0P0001KW2U.ST", "Sverigefond (index)", 5, 0.1, "PLUS Fonder"],
  ["0P0000Y4W5.ST", "Småbolagsfond Sverige", 5, 1.5, "SEB"],
  ["0P00000LQ4.ST", "Tillväxtmarknadsfond", 5, 1.75, "SEB"],
  ["0P00000IAJ.ST", "Globalfond", 4, 1.4, "Skandia"],
  ["0P0001HQAE.ST", "Sverigefond", 5, 1.0, "Lannebo"],
];
