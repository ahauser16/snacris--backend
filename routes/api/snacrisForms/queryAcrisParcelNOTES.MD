# `queryAcrisParcel` NOTES

I'm refactoring `queryAcrisParcel.js` to use the same sequential, API calls as `queryAcrisPartyName.js`.  Currently the data is coming from the frontend in the form below.

```bash
Received request with query parameters: {
  masterSearchTerms: {
    recorded_date_range: 'last-2-years',
    recorded_date_start: '2023-05-27',
    recorded_date_end: '2025-05-26',
    doc_type: 'doc-type-default',
    doc_class: 'DEEDS AND OTHER CONVEYANCES'
  },
  legalsSearchTerms: { borough: '3', block: '05159', lot: '47', unit: '' }
}
```

There is 1 `queryUrl` being created by 

```bash
https://data.cityofnewyork.us/resource/bnx9-e6tj.json?$select=document_id&$where=doc_type IN ('ASTU', 'CNTR', 'CODP', 'DCTO', 'DEED', 'EASE', 'IDED', 'LEAS', 'LTPA', 'SUBL', 'VAC', 'CDEC', 'DEEDO', 'DEVR', 'DECM', 'MLEA', 'MCON', 'ACON', 'CORRD', 'CONDEED', 'REIT', 'NAPP', 'DEED COR', 'DEED, LE', 'CORR, LE', 'DEED, TS', 'AIRRIGHT', 'SI CORR', 'DEEDP', 'TORREN', 'DEED, RC', 'SCDEC', 'TODD', 'RTOD') AND recorded_datetime between '2023-05-27' and '2025-05-26' AND document_id IN ('2020100700809001', '2020100700809002', '2017062800007002', '2017062800007001', 'FT_3210005545221', 'BK_7230060101447', 'FT_3720005010972', 'BK_8030116700912', 'FT_3160000953316', 'BK_7530078101736', 'FT_3290005545229', 'FT_3390001095739', '2013053000805003', '2005010600534002', 'FT_3030001026203', 'BK_7230060101439', 'FT_3840001246684', 'FT_3260005545226', 'FT_3810001502381', 'FT_3280005545228', '2005010600534004', 'BK_7730091601983', 'FT_3220005545222', '2013053000805002', 'FT_3810001246681', 'FT_3150000953315', 'BK_6830029501885', 'FT_3400001002240', 'FT_3530004500253', 'FT_3820001502382', 'BK_6830029501879', 'FT_3450001247145', '2005010600534001', 'BK_6830029501881', 'FT_3850001246685', 'FT_3830001246683', 'FT_3400001095740', 'FT_3820001246682', 'BK_7530078101731', 'FT_3800001246680', 'FT_3160005545216', '2013053000805005', 'FT_3170005545217', 'BK_7230060101443', 'FT_3270005545227', '2005010600534003', 'FT_3910000966591', 'BK_7730090900605', 'FT_3860001246686', 'BK_6830029501877', '2013053000805001', 'BK_7730091601981', 'BK_7730091601987', 'BK_7230060101441', 'FT_3520001266352', 'BK_7730090900603') 1 MasterRealPropApi queryUrls
Error fetching document IDs from Real Property Master API (cross-ref): No Real Property Master records found for the given query.
Error fetching ACRIS dataset: Failed to fetch document IDs from Real Property Master API (cross-ref)
GET /queryAcrisParcel/fetchRecord?masterSearchTerms[recorded_date_range]=last-2-years&masterSearchTerms[recorded_date_start]=2023-05-27&masterSearchTerms[recorded_date_end]=2025-05-26&masterSearchTerms[doc_type]=doc-type-default&masterSearchTerms[doc_class]=DEEDS+AND+OTHER+CONVEYANCES&legalsSearchTerms[borough]=3&legalsSearchTerms[block]=05159&legalsSearchTerms[lot]=47&legalsSearchTerms[unit]= 500 143 - 1983.269 ms
```

## `queryAcrisPartyName` console.log flow:
```bash
User authenticated: { username: 'april152025', isAdmin: false, iat: 1747576718 }
Received request with query parameters: {
  masterSearchTerms: {
    recorded_date_range: 'last-90-days',
    recorded_date_start: '2025-02-25',
    recorded_date_end: '2025-05-26',
    doc_type: 'doc-type-default',
    doc_class: 'DEEDS AND OTHER CONVEYANCES'
  },
  partySearchTerms: { name: 'EMPIRE', party_type: '1' },
  legalsSearchTerms: { borough: '3' }
}
'/fetchAcrisDocumentIds(masterQueryParams)' calls 'SoqlUrl.constructUrl' creating: https://data.cityofnewyork.us/resource/bnx9-e6tj.json?$select=document_id&$where=doc_type IN ('ASTU', 'CNTR', 'CODP', 'DCTO', 'DEED', 'EASE', 'IDED', 'LEAS', 'LTPA', 'SUBL', 'VAC', 'CDEC', 'DEEDO', 'DEVR', 'DECM', 'MLEA', 'MCON', 'ACON', 'CORRD', 'CONDEED', 'REIT', 'NAPP', 'DEED COR', 'DEED, LE', 'CORR, LE', 'DEED, TS', 'AIRRIGHT', 'SI CORR', 'DEEDP', 'TORREN', 'DEED, RC', 'SCDEC', 'TODD', 'RTOD') AND recorded_datetime between '2025-02-25' and '2025-05-26'&$limit=1000
'/fetchAcrisDocumentIds(masterQueryParams)' calls 'SoqlUrl.constructUrl' creating: https://data.cityofnewyork.us/resource/bnx9-e6tj.json?$select=document_id&$where=doc_type IN ('ASTU', 'CNTR', 'CODP', 'DCTO', 'DEED', 'EASE', 'IDED', 'LEAS', 'LTPA', 'SUBL', 'VAC', 'CDEC', 'DEEDO', 'DEVR', 'DECM', 'MLEA', 'MCON', 'ACON', 'CORRD', 'CONDEED', 'REIT', 'NAPP', 'DEED COR', 'DEED, LE', 'CORR, LE', 'DEED, TS', 'AIRRIGHT', 'SI CORR', 'DEEDP', 'TORREN', 'DEED, RC', 'SCDEC', 'TODD', 'RTOD') AND recorded_datetime between '2025-02-25' and '2025-05-26'&$limit=1000&$offset=1000
'/fetchAcrisDocumentIds(masterQueryParams)' calls 'SoqlUrl.constructUrl' creating: https://data.cityofnewyork.us/resource/bnx9-e6tj.json?$select=document_id&$where=doc_type IN ('ASTU', 'CNTR', 'CODP', 'DCTO', 'DEED', 'EASE', 'IDED', 'LEAS', 'LTPA', 'SUBL', 'VAC', 'CDEC', 'DEEDO', 'DEVR', 'DECM', 'MLEA', 'MCON', 'ACON', 'CORRD', 'CONDEED', 'REIT', 'NAPP', 'DEED COR', 'DEED, LE', 'CORR, LE', 'DEED, TS', 'AIRRIGHT', 'SI CORR', 'DEEDP', 'TORREN', 'DEED, RC', 'SCDEC', 'TODD', 'RTOD') AND recorded_datetime between '2025-02-25' and '2025-05-26'&$limit=1000&$offset=2000
'/fetchAcrisDocumentIds(masterQueryParams)' calls 'SoqlUrl.constructUrl' creating: https://data.cityofnewyork.us/resource/bnx9-e6tj.json?$select=document_id&$where=doc_type IN ('ASTU', 'CNTR', 'CODP', 'DCTO', 'DEED', 'EASE', 'IDED', 'LEAS', 'LTPA', 'SUBL', 'VAC', 'CDEC', 'DEEDO', 'DEVR', 'DECM', 'MLEA', 'MCON', 'ACON', 'CORRD', 'CONDEED', 'REIT', 'NAPP', 'DEED COR', 'DEED, LE', 'CORR, LE', 'DEED, TS', 'AIRRIGHT', 'SI CORR', 'DEEDP', 'TORREN', 'DEED, RC', 'SCDEC', 'TODD', 'RTOD') AND recorded_datetime between '2025-02-25' and '2025-05-26'&$limit=1000&$offset=3000
'/fetchAcrisDocumentIds(masterQueryParams)' calls 'SoqlUrl.constructUrl' creating: https://data.cityofnewyork.us/resource/bnx9-e6tj.json?$select=document_id&$where=doc_type IN ('ASTU', 'CNTR', 'CODP', 'DCTO', 'DEED', 'EASE', 'IDED', 'LEAS', 'LTPA', 'SUBL', 'VAC', 'CDEC', 'DEEDO', 'DEVR', 'DECM', 'MLEA', 'MCON', 'ACON', 'CORRD', 'CONDEED', 'REIT', 'NAPP', 'DEED COR', 'DEED, LE', 'CORR, LE', 'DEED, TS', 'AIRRIGHT', 'SI CORR', 'DEEDP', 'TORREN', 'DEED, RC', 'SCDEC', 'TODD', 'RTOD') AND recorded_datetime between '2025-02-25' and '2025-05-26'&$limit=1000&$offset=4000
'/fetchAcrisDocumentIds(masterQueryParams)' calls 'SoqlUrl.constructUrl' creating: https://data.cityofnewyork.us/resource/bnx9-e6tj.json?$select=document_id&$where=doc_type IN ('ASTU', 'CNTR', 'CODP', 'DCTO', 'DEED', 'EASE', 'IDED', 'LEAS', 'LTPA', 'SUBL', 'VAC', 'CDEC', 'DEEDO', 'DEVR', 'DECM', 'MLEA', 'MCON', 'ACON', 'CORRD', 'CONDEED', 'REIT', 'NAPP', 'DEED COR', 'DEED, LE', 'CORR, LE', 'DEED, TS', 'AIRRIGHT', 'SI CORR', 'DEEDP', 'TORREN', 'DEED, RC', 'SCDEC', 'TODD', 'RTOD') AND recorded_datetime between '2025-02-25' and '2025-05-26'&$limit=1000&$offset=5000
'/fetchAcrisDocumentIds(masterQueryParams)' calls 'SoqlUrl.constructUrl' creating: https://data.cityofnewyork.us/resource/bnx9-e6tj.json?$select=document_id&$where=doc_type IN ('ASTU', 'CNTR', 'CODP', 'DCTO', 'DEED', 'EASE', 'IDED', 'LEAS', 'LTPA', 'SUBL', 'VAC', 'CDEC', 'DEEDO', 'DEVR', 'DECM', 'MLEA', 'MCON', 'ACON', 'CORRD', 'CONDEED', 'REIT', 'NAPP', 'DEED COR', 'DEED, LE', 'CORR, LE', 'DEED, TS', 'AIRRIGHT', 'SI CORR', 'DEEDP', 'TORREN', 'DEED, RC', 'SCDEC', 'TODD', 'RTOD') AND recorded_datetime between '2025-02-25' and '2025-05-26'&$limit=1000&$offset=6000
'/fetchAcrisDocumentIds(masterQueryParams)' calls 'SoqlUrl.constructUrl' creating: https://data.cityofnewyork.us/resource/bnx9-e6tj.json?$select=document_id&$where=doc_type IN ('ASTU', 'CNTR', 'CODP', 'DCTO', 'DEED', 'EASE', 'IDED', 'LEAS', 'LTPA', 'SUBL', 'VAC', 'CDEC', 'DEEDO', 'DEVR', 'DECM', 'MLEA', 'MCON', 'ACON', 'CORRD', 'CONDEED', 'REIT', 'NAPP', 'DEED COR', 'DEED, LE', 'CORR, LE', 'DEED, TS', 'AIRRIGHT', 'SI CORR', 'DEEDP', 'TORREN', 'DEED, RC', 'SCDEC', 'TODD', 'RTOD') AND recorded_datetime between '2025-02-25' and '2025-05-26'&$limit=1000&$offset=7000
'/fetchAcrisDocumentIds(masterQueryParams)' calls 'SoqlUrl.constructUrl' creating: https://data.cityofnewyork.us/resource/bnx9-e6tj.json?$select=document_id&$where=doc_type IN ('ASTU', 'CNTR', 'CODP', 'DCTO', 'DEED', 'EASE', 'IDED', 'LEAS', 'LTPA', 'SUBL', 'VAC', 'CDEC', 'DEEDO', 'DEVR', 'DECM', 'MLEA', 'MCON', 'ACON', 'CORRD', 'CONDEED', 'REIT', 'NAPP', 'DEED COR', 'DEED, LE', 'CORR, LE', 'DEED, TS', 'AIRRIGHT', 'SI CORR', 'DEEDP', 'TORREN', 'DEED, RC', 'SCDEC', 'TODD', 'RTOD') AND recorded_datetime between '2025-02-25' and '2025-05-26'&$limit=1000&$offset=8000
'/fetchAcrisDocumentIds(masterQueryParams)' calls 'SoqlUrl.constructUrl' creating: https://data.cityofnewyork.us/resource/bnx9-e6tj.json?$select=document_id&$where=doc_type IN ('ASTU', 'CNTR', 'CODP', 'DCTO', 'DEED', 'EASE', 'IDED', 'LEAS', 'LTPA', 'SUBL', 'VAC', 'CDEC', 'DEEDO', 'DEVR', 'DECM', 'MLEA', 'MCON', 'ACON', 'CORRD', 'CONDEED', 'REIT', 'NAPP', 'DEED COR', 'DEED, LE', 'CORR, LE', 'DEED, TS', 'AIRRIGHT', 'SI CORR', 'DEEDP', 'TORREN', 'DEED, RC', 'SCDEC', 'TODD', 'RTOD') AND recorded_datetime between '2025-02-25' and '2025-05-26'&$limit=1000&$offset=9000
'/fetchAcrisDocumentIds(masterQueryParams)' calls 'SoqlUrl.constructUrl' creating: https://data.cityofnewyork.us/resource/bnx9-e6tj.json?$select=document_id&$where=doc_type IN ('ASTU', 'CNTR', 'CODP', 'DCTO', 'DEED', 'EASE', 'IDED', 'LEAS', 'LTPA', 'SUBL', 'VAC', 'CDEC', 'DEEDO', 'DEVR', 'DECM', 'MLEA', 'MCON', 'ACON', 'CORRD', 'CONDEED', 'REIT', 'NAPP', 'DEED COR', 'DEED, LE', 'CORR, LE', 'DEED, TS', 'AIRRIGHT', 'SI CORR', 'DEEDP', 'TORREN', 'DEED, RC', 'SCDEC', 'TODD', 'RTOD') AND recorded_datetime between '2025-02-25' and '2025-05-26'&$limit=1000&$offset=10000
'/fetchAcrisDocumentIds(masterQueryParams)' calls 'SoqlUrl.constructUrl' creating: https://data.cityofnewyork.us/resource/bnx9-e6tj.json?$select=document_id&$where=doc_type IN ('ASTU', 'CNTR', 'CODP', 'DCTO', 'DEED', 'EASE', 'IDED', 'LEAS', 'LTPA', 'SUBL', 'VAC', 'CDEC', 'DEEDO', 'DEVR', 'DECM', 'MLEA', 'MCON', 'ACON', 'CORRD', 'CONDEED', 'REIT', 'NAPP', 'DEED COR', 'DEED, LE', 'CORR, LE', 'DEED, TS', 'AIRRIGHT', 'SI CORR', 'DEEDP', 'TORREN', 'DEED, RC', 'SCDEC', 'TODD', 'RTOD') AND recorded_datetime between '2025-02-25' and '2025-05-26'&$limit=1000&$offset=11000
'/fetchAcrisDocumentIds(masterQueryParams)' calls 'SoqlUrl.constructUrl' creating: https://data.cityofnewyork.us/resource/bnx9-e6tj.json?$select=document_id&$where=doc_type IN ('ASTU', 'CNTR', 'CODP', 'DCTO', 'DEED', 'EASE', 'IDED', 'LEAS', 'LTPA', 'SUBL', 'VAC', 'CDEC', 'DEEDO', 'DEVR', 'DECM', 'MLEA', 'MCON', 'ACON', 'CORRD', 'CONDEED', 'REIT', 'NAPP', 'DEED COR', 'DEED, LE', 'CORR, LE', 'DEED, TS', 'AIRRIGHT', 'SI CORR', 'DEEDP', 'TORREN', 'DEED, RC', 'SCDEC', 'TODD', 'RTOD') AND recorded_datetime between '2025-02-25' and '2025-05-26'&$limit=1000&$offset=12000
'/fetchAcrisDocumentIds(masterQueryParams)' calls 'SoqlUrl.constructUrl' creating: https://data.cityofnewyork.us/resource/bnx9-e6tj.json?$select=document_id&$where=doc_type IN ('ASTU', 'CNTR', 'CODP', 'DCTO', 'DEED', 'EASE', 'IDED', 'LEAS', 'LTPA', 'SUBL', 'VAC', 'CDEC', 'DEEDO', 'DEVR', 'DECM', 'MLEA', 'MCON', 'ACON', 'CORRD', 'CONDEED', 'REIT', 'NAPP', 'DEED COR', 'DEED, LE', 'CORR, LE', 'DEED, TS', 'AIRRIGHT', 'SI CORR', 'DEEDP', 'TORREN', 'DEED, RC', 'SCDEC', 'TODD', 'RTOD') AND recorded_datetime between '2025-02-25' and '2025-05-26'&$limit=1000&$offset=13000
Document ID 2025040900070001 is present in masterRecordsDocumentIds.
Document ID 2025021800719001 is present in masterRecordsDocumentIds.
Document ID 2025040900509001 is present in masterRecordsDocumentIds.
https://data.cityofnewyork.us/resource/636b-3b5g.json?$select=document_id&$where=party_type='1' AND name like '%25EMPIRE%25' AND document_id IN ('2025032800497001', '2025040400343001', '2025031900850001', '2025040200022001', '2025040300393001', '2025022000830001', '2025040100461001', '2025040100354004', '2025040100001001', '2025040100152001', '2025040200708001', '2025040100663001', '2025040300446001', '2025040300816001', '2025040100239005', '2025033100403001', '2025033100643001', '2025040100473001', '2025040200363005', '2025040200292001', '2025040100171001', '2025032800488002', '2025031000781001', '2025040200414001', '2024110100866001', '2025031700514002', '2025040200448001', '2025031100865002', '2025040201123001', '2025040301047001', '2025031400556002', '2025033100678001', '2025032400896001', '2025031800266002', '2025033000049001', '2025032800808001', '2025033100434001', '2025033100293001', '2025031200747002', '2025032500581002', '2025040200092001', '2025032900021001', '2025032500247001', '2025040200151001', '2025040100669001', '2025040100152003', '2025040200381002', '2025033100881003', '2025032600573001', '2025040200531001', '2025040300467001', '2025040201159001', '2025032600782001', '2025040201162001', '2025040200830001', '2025040300246001', '2025033100663001', '2025032000610003', '2025040301148001', '2025040100232001', '2025033100900001', '2025040301000001', '2025033100683001', '2025040100308001', '2025031900989001', '2025033100521001', '2025032400524001', '2025033100139001', '2025040100347001', '2025032800653001', '2025040100173001', '2025040100231001', '2025033100362001', '2025032700141001', '2025032800219003', '2025040100403001', '2025040100385008', '2025033100215003', '2025032700104011', '2025040100174008', '2025032800880001', '2025040200363011', '2025040100815001', '2025040100795001', '2025033100836001', '2025033100198001', '2025032000896001', '2025032000683001', '2025032700899001', '2025040100098001', '2025032900027001', '2025040100502001', '2025040200405001', '2025040200064004', '2025033100410001', '2025033101012001', '2025040200976001', '2025040300361001', '2025040100854001', '2025032400773001', '2025040200240001', '2025032000783001', '2025032400900001', '2025040100757001', '2025040300117001', '2025040200504001', '2025032800750002', '2025032800299001', '2025040200381001', '2025040200737002', '2025040200508001', '2025040200056001', '2025040100870001', '2025040200190001', '2025032100576003', '2025032600873001', '2025040400541001', '2025040200698001', '2025032600576001', '2025033100941001', '2025040200653001', '2025040300459001', '2025021901009001', '2025040300433001', '2025032400880001', '2025040400155001', '2025032700104012', '2025032800602001', '2025032800548001', '2025040100560001', '2025040100174004', '2025031400454001', '2025032100367001', '2025022100719003', '2025040100163009', '2025033100835001', '2025040100259004', '2025032100487001', '2025032100439002', '2025033100430001', '2025032600371001', '2025032800644001', '2025040100295004', '2025033100474001', '2025033100177001', '2025033100483001', '2025030400847001', '2025032600146001', '2025033100496001', '2025040100133001', '2025031900100001', '2025032100689001', '2025040100367001', '2025032700104013', '2025032800219004', '2025033100644001', '2025032000825002', '2025032600781001', '2025032500760001', '2025032700476001', '2025033100433002', '2025033100504001', '2025032800322001', '2025021600033001', '2025033100192001', '2025030700334003', '2025040200183001', '2025040200066001', '2025040200255001', '2025032000732001', '2025030400553001', '2025032900015003', '2025040200330001', '2025032100495002', '2025032100438001', '2025040100785001', '2025040100769001', '2025033100167001', '2025040101038001', '2025040100448001', '2025040101040001', '2025040200073003', '2025032500829001', '2025032700182001', '2025033100772001', '2025033100342001', '2025040200401001', '2025040200087001', '2025040100825001', '2025040200045001', '2025040100599001', '2025032800197003', '2025040100885004', '2025040200189002', '2025040100708001', '2025032500846001', '2025040200737003', '2025040200466001', '2025033100138001', '2025032800775001', '2025033100994001', '2025032500303001', '2025040300566001', '2025040200202001', '2025032400322001', '2025040200870006', '2025040200737001', '2025032800151001', '2025040200724001', '2025021100934001', '2025040200927001', '2025040201036007', '2025040200790001', '2025040100941002', '2025040101047001', '2025040300406003', '2025032700527001', '2025040300505006', '2025032700353001', '2024101700379001', '2025032400195001', '2025040101035002', '2025033000045001', '2025040100859001', '2025040200481001', '2025040300556003', '2025040300302001', '2025032501016001', '2025040100771001', '2025040100763001', '2025040100097003', '2025040200467001', '2025040201160002', '2025040200374001', '2025040300444001', '2025033100179001', '2025040300732001', '2025040400131004', '2025033100751002', '2025033100682001', '2025040200027002', '2025040200804001', '2025040200571002', '2025032800294001', '2025040300680001', '2025040200265002', '2025040201156001', '2025032600849001', '2025040301056001', '2025040300847001', '2025030400086001', '2025032500893001', '2025040301093001', '2025040400112001', '2025031200495001', '2025032500618001', '2025040100224001', '2025031301223001', '2025033100614001', '2025032800539001', '2025032800717001', '2025031900183001', '2025033100684001', '2025040100253001', '2025033100676001', '2025033100277001', '2025040100501001', '2025040100558008', '2025032500603002', '2025032800116001', '2025033100346001', '2025040100558001', '2025032600866001', '2025040100354007', '2025040100413001', '2025040100387001', '2025040100558005', '2025033100674001', '2025032800866001', '2025040100086005', '2025032100565001', '2025032800100001', '2025040100440001', '2025032600833001', '2025032800632001', '2025033100394001', '2025032800748001', '2025040100224006', '2025040100150001', '2025033100360001', '2025033100699001', '2025040100354001', '2025032800709001', '2025040100318002', '2025033100146002', '2025021800323003', '2025040100163001', '2025040100374001', '2025033000033002', '2024070900763001', '2025033100796001', '2025033100845001', '2025033100645001', '2025032701066001', '2025040100329001', '2025033100615001', '2025033100813001', '2025033100960001', '2025021800891002', '2025032800842001', '2025032800678001', '2025033100415001', '2025033100258001', '2025040100480001', '2025033100351001', '2025032601060001', '2025032600853001', '2025040100239007', '2025033000029001', '2025033100959001', '2025032600790001', '2025032800219005', '2025040100440005', '2025031200951001', '2025032800510001', '2025032800783001', '2025040100385004', '2025032600982001', '2025033100341001', '2025040100248001', '2025031700278003', '2025040100231005', '2025040100466001', '2025040101048003', '2025033000013001', '2025020600498001', '2025032100528001', '2025032100553001', '2025032600638003', '2025033100273001', '2025040100091001', '2025040200363001', '2025033100780001', '2025040200552001', '2025040200468001', '2025040200025001', '2025040100397001', '2025040100618001', '2025040200363003', '2025032800343001', '2025033100519001', '2025040200156001', '2025040200176001', '2025032700243003', '2025040100877001', '2025032100299001', '2025040200231001', '2025033100653001', '2025040100229001', '2025032200020001', '2025031200803004', '2025040200375001', '2025040100475001', '2025033100803001', '2025040200028001', '2025040100456001', '2025033100775001', '2025033100750001', '2025040200305001', '2025040200281002', '2025040100824001', '2025031901087001', '2025040200312001', '2025032100031001', '2025040100553001', '2025032700268001', '2025040100910001', '2025040200081001', '2025032800453001', '2025040200061005', '2025032800061001', '2025040101036001', '2025040200322002', '2025032700026001', '2025033000015001', '2025040100728001', '2025040100008001', '2025040200144001', '2025040100678001', '2025033100919003', '2025040200049001', '2025040200774001', '2025032000849001', '2025040300154001', '2025040200369001', '2025040101024002', '2025040300026002', '2025032400503001', '2025040201036013', '2025040100727001', '2025021600014001', '2025033000007001', '2025031301130001', '2024080400039001', '2025021200203001', '2025021100412001', '2025040200123001', '2025040200870005', '2025040100122001', '2025032700959001', '2025040100973001', '2025032400450001', '2025032600770001', '2025021100436001', '2025031201068001', '2025033100402001', '2025040200526001', '2025040200173001', '2025040200103001', '2025031800097001', '2025040300010001', '2025040100373001', '2025040200011001', '2025040200274001', '2025022000680001', '2025040200739001', '2025032400460001', '2025033100978002', '2025010700056001', '2025040100858001', '2025040100937001', '2025013100883001', '2025040200637001', '2025040200412001', '2025040100531001', '2025032100551001', '2025032800253001', '2025031900821001', '2025022700837001', '2025040100535001', '2025033100473002', '2024092300961001', '2025040200648001', '2025031100461001', '2023040600552001', '2025040300505009', '2025032800525001', '2025032700859001', '2025040100963001', '2025040200436001', '2025040300397002', '2025040300082001', '2025011500092001', '2025040200514001', '2025040300434002', '2025032800516001', '2025040200501001', '2025040300154002', '2025040300255001', '2025040200474001', '2025040300256001', '2025032100615001', '2025040100789001', '2025040300533001', '2025040200047001', '2025040200911001', '2025040200404001', '2025040100262003', '2025032601010001', '2025040200826001', '2025040301064001', '2025040300618001', '2025040300769001', '2025040300218001', '2025040200841001', '2025032600838001', '2025040200703001', '2025040100537001', '2025040300484001', '2025040200924001', '2025040100197001', '2025040201017001', '2025040400541007', '2025040400358001', '2025040301060001', '2025040400524004', '2025033100846001', '2025040101020003', '2025040201065001', '2025040400524007', '2025040400037001', '2025040300657001', '2025040100679001', '2025032800570001', '2025040300432001', '2025040200271001', '2025040300285002', '2025040200859001', '2025040301004001', '2025040300999006') PartiesRealPropApi queryUrls queryUrls.length: 24
https://data.cityofnewyork.us/resource/8h5j-fqxa.json?$select=document_id&$where=borough=3 AND document_id IN ('2025040700480001', '2025040900070001', '2025040900509001', '2025032500301001', '2025021800719001') 1 LegalsRealPropApi queryUrls
https://data.cityofnewyork.us/resource/bnx9-e6tj.json?$where=document_id IN ('2025040700480001', '2025040900070001', '2025040900509001', '2025021800719001')&$limit=1000 MasterRealPropApi.fetchAcrisRecordsByDocumentIds url
https://data.cityofnewyork.us/resource/636b-3b5g.json?$where=document_id IN ('2025040700480001', '2025040900070001', '2025040900509001', '2025021800719001')&$limit=1000 PartiesRealPropApi.fetchAcrisRecordsByDocumentIds url
https://data.cityofnewyork.us/resource/8h5j-fqxa.json?$where=document_id IN ('2025040700480001', '2025040900070001', '2025040900509001', '2025021800719001')&$limit=1000 LegalsRealPropApi.fetchAcrisRecordsByDocumentIds url
GET /queryAcrisPartyName/fetchRecord?masterSearchTerms[recorded_date_range]=last-90-days&masterSearchTerms[recorded_date_start]=2025-02-25&masterSearchTerms[recorded_date_end]=2025-05-26&masterSearchTerms[doc_type]=doc-type-default&masterSearchTerms[doc_class]=DEEDS+AND+OTHER+CONVEYANCES&partySearchTerms[name]=EMPIRE&partySearchTerms[party_type]=1&legalsSearchTerms[borough]=3 304 - - 22553.857 ms
```

## `queryAcrisParcel` console.log flow

```js
"use strict";

/** Routes for ACRIS Real Property Parcel (Master + Legals) API calls. */

const express = require("express");
const MasterRealPropApi = require("../../../thirdPartyApi/acris/real-property/MasterRealPropApi");
const LegalsRealPropApi = require("../../../thirdPartyApi/acris/real-property/LegalsRealPropApi");
const PartiesRealPropApi = require("../../../thirdPartyApi/acris/real-property/PartiesRealPropApi");
const ReferencesRealPropApi = require("../../../thirdPartyApi/acris/real-property/ReferencesRealPropApi");
const RemarksRealPropApi = require("../../../thirdPartyApi/acris/real-property/RemarksRealPropApi");
const DocTypesCodeMapModel = require("../../../models/acris/code-maps/DocTypesCodeMapModel");

const router = new express.Router();

router.get("/fetchRecord", async function (req, res, next) {
    try {
        console.log("Received request with query parameters:", req.query);

        const { masterSearchTerms, legalsSearchTerms } = req.query;
        const masterQueryParams = {};
        if (masterSearchTerms?.recorded_date_range)
            masterQueryParams.recorded_date_range = masterSearchTerms.recorded_date_range;
        if (masterSearchTerms?.recorded_date_start)
            masterQueryParams.recorded_date_start = masterSearchTerms.recorded_date_start;
        if (masterSearchTerms?.recorded_date_end)
            masterQueryParams.recorded_date_end = masterSearchTerms.recorded_date_end;
        if (masterSearchTerms?.doc_type === "doc-type-default" && masterSearchTerms?.doc_class) {
            if (masterSearchTerms.doc_class !== "all-class-default") {
                try {
                    const docTypes = await DocTypesCodeMapModel.getDocTypesByClass(masterSearchTerms.doc_class);
                    masterQueryParams.doc_type = docTypes;
                } catch (err) {
                    return res.status(400).json({ error: `Invalid doc_class: ${masterSearchTerms.doc_class}` });
                }
            }
        } else if (masterSearchTerms?.doc_type) {
            masterQueryParams.doc_type = masterSearchTerms.doc_type;
        }

        // Legals: borough, block, lot (required), unit (optional)
        const legalsQueryParams = {};
        if (legalsSearchTerms?.borough)
            legalsQueryParams.borough = legalsSearchTerms.borough;
        if (legalsSearchTerms?.block)
            legalsQueryParams.block = legalsSearchTerms.block;
        if (legalsSearchTerms?.lot)
            legalsQueryParams.lot = legalsSearchTerms.lot;
        if (legalsSearchTerms?.unit)
            legalsQueryParams.unit = legalsSearchTerms.unit;

        // Validate required fields for legals
        if (!legalsQueryParams.borough || !legalsQueryParams.block || !legalsQueryParams.lot) {
            return res.status(400).json({ error: "borough, block, and lot are required in legalsSearchTerms." });
        }

        let crossReferencedDocumentIds = [];

        //<--- THE ISSUE STARTS FROM HERE --->
        try {
            // Step 1: Fetch legals document IDs
            const legalsRecordsDocumentIds = await LegalsRealPropApi.fetchAcrisDocumentIds(legalsQueryParams);
            console.log(legalsRecordsDocumentIds, "legalsRecordsDocumentIds");
            // CONFIRMED THAT `legalsRecordsDocumentIds` is in fact an array of document_id values (SEE BELOW)


            // Step 2: Fetch master document IDs cross-referenced with legals
            let masterRecordsDocumentIds = [];
            if (legalsRecordsDocumentIds && legalsRecordsDocumentIds.length > 0) {
                masterRecordsDocumentIds = await MasterRealPropApi.fetchAcrisDocumentIdsCrossRef(
                    console.log(masterRecordsDocumentIds, "masterRecordsDocumentIds");
                    //CONFIRM THAT `masterRecordsDocumentIds` is in fact an array of `document_id` values
                    masterQueryParams,
                    legalsRecordsDocumentIds
                );
            } else {
                console.log("No legals records found, skipping master records fetch");
            }
            crossReferencedDocumentIds = masterRecordsDocumentIds;
            //console.log(crossReferencedDocumentIds, "crossReferencedDocumentIds");

        } catch (err) {
            console.error("Error fetching ACRIS dataset:", err.message);
            return res.status(500).json({
                dataFound: false,
                datasets: "Real Property: Master, Legals",
                error: err.message
            });
        }

        // Fetch full records from all datasets in parallel using crossReferencedDocumentIds
        try {
            const [
                masterRecords,
                partiesRecords,
                legalsRecords,
                referencesRecords,
                remarksRecords
            ] = await Promise.all([
                MasterRealPropApi.fetchAcrisRecordsByDocumentIds(crossReferencedDocumentIds),
                PartiesRealPropApi.fetchAcrisRecordsByDocumentIds(crossReferencedDocumentIds),
                LegalsRealPropApi.fetchAcrisRecordsByDocumentIds(crossReferencedDocumentIds),
                ReferencesRealPropApi.fetchAcrisRecordsByDocumentIds(crossReferencedDocumentIds),
                RemarksRealPropApi.fetchAcrisRecordsByDocumentIds(crossReferencedDocumentIds)
            ]);

            // Build newResults array
            const results = crossReferencedDocumentIds.map(document_id => ({
                document_id,
                masterRecords: (masterRecords || []).filter(r => r.document_id === document_id),
                partiesRecords: (partiesRecords || []).filter(r => r.document_id === document_id),
                legalsRecords: (legalsRecords || []).filter(r => r.document_id === document_id),
                referencesRecords: (referencesRecords || []).filter(r => r.document_id === document_id),
                remarksRecords: (remarksRecords || []).filter(r => r.document_id === document_id)
            }));

            console.log(results);

            return res.json(results);
        } catch (err) {
            console.error("Error fetching full records from datasets:", err.message);
            return res.status(500).json({
                dataFound: false,
                error: "Failed to fetch full records from all datasets",
                details: err.message
            });
        }
    } catch (err) {
        console.error("Error in queryAcrisParcel route:", err.message);
        return next(err);
    }
});

module.exports = router;
```

### `console.log(legalsRecordsDocumentIds, "legalsRecordsDocumentIds");`

```bash
[
  '2020100700809001', '2020100700809002', '2017062800007002',
  '2017062800007001', 'FT_3210005545221', 'BK_7230060101447',
  'FT_3720005010972', 'BK_8030116700912', 'FT_3160000953316',
  'BK_7530078101736', 'FT_3290005545229', 'FT_3390001095739',
  '2013053000805003', '2005010600534002', 'FT_3030001026203',
  'BK_7230060101439', 'FT_3840001246684', 'FT_3260005545226',
  'FT_3810001502381', 'FT_3280005545228', '2005010600534004',
  'BK_7730091601983', 'FT_3220005545222', '2013053000805002',
  'FT_3810001246681', 'FT_3150000953315', 'BK_6830029501885',
  'FT_3400001002240', 'FT_3530004500253', 'FT_3820001502382',
  'BK_6830029501879', 'FT_3450001247145', '2005010600534001',
  'BK_6830029501881', 'FT_3850001246685', 'FT_3830001246683',
  'FT_3400001095740', 'FT_3820001246682', 'BK_7530078101731',
  'FT_3800001246680', 'FT_3160005545216', '2013053000805005',
  'FT_3170005545217', 'BK_7230060101443', 'FT_3270005545227',
  '2005010600534003', 'FT_3910000966591', 'BK_7730090900605',
  'FT_3860001246686', 'BK_6830029501877', '2013053000805001',
  'BK_7730091601981', 'BK_7730091601987', 'BK_7230060101441',
  'FT_3520001266352', 'BK_7730090900603'
] legalsRecordsDocumentIds
```

