// One entry per branch (taken from CHECK_VOUCHER_2025.xlsx).
// `defaults` are editable in the app and saved in the browser.
// `logo` = image in public/logos, otherwise `title` is printed in `titleFont`.
const GM = 'MARIE DOMINIQUE G. PERFECTO'
const CHK = 'MA. STELLA G. PERFECTO'
const mk = (o) => ({
  showTin: false,
  titleFont: "'Libre Baskerville', serif",
  titleSize: '16pt',
  ...o,
  defaults: {
    tin: '',
    titleColor: '#1155cc',
    preparedRole: '',
    checkedRole: '',
    approvedBy: GM,
    approvedRole: 'General Manager',
    checkedBy: CHK,
    ...o.defaults,
  },
})

export const BRANCHES = [
  mk({
    id: 'atria', label: 'DEMIC ATRIA', logo: 'atria.png', showTin: true, start: 401,
    defaults: {
      address: 'DONATO PISON AVE., SAN RAFAEL , MANDURRIAO ILOILO CITY',
      phone: '(003)5035367/09053455422',
      bank: 'SECURITY BANK',
      preparedBy: 'MARY JOY R. TESING', preparedRole: 'ACCOUNTING STAFF',
      checkedBy: 'CLARIBEL MOQUETE', checkedRole: 'FINANCE',
      approvedRole: 'GENERAL MANAGER',
    },
  }),
  mk({
    id: 'jaro', label: 'DEMIC LAB JARO', logo: 'jaro.png', showTin: true, start: 399,
    defaults: {
      address: '2F ROSMAN BLDG. MCARTHUR DRIVE, TABUC SUBA JARO,ILOILO CITY',
      phone: '0995 5888 983',
      bank: 'PBB',
      preparedBy: 'MARY JOY R. TESING',
      checkedBy: GM,
    },
  }),
  mk({
    id: 'stella', label: 'STELLA', logo: 'stella.png', start: 1628,
    defaults: {
      address: 'Greenfield, Diversion Road Mandurriao, Iloilo City',
      phone: 'Telephone No.: (033) 338-9995',
      bank: 'EASTWEST',
      preparedBy: 'JESSA MAE DEPITA',
    },
  }),
  mk({
    id: 'pub', label: 'PUB EXPRESS RESTO', logo: 'pub.png', showTin: true, start: 1179,
    defaults: {
      address: 'ANNEX SM CITY MANDURRIAO, ILOILO CITY 5000',
      phone: 'Telephone No.: (033) 503-6604',
      tin: '412-622-286-003',
      bank: 'BDO',
      preparedBy: 'MARIAN A. PACARAT',
    },
  }),
  mk({
    id: 'dois', label: 'DOIS', logo: 'dois.png', start: 1200,
    defaults: {
      address: 'TABUC SUBA JARO,ILOILO CITY',
      phone: 'Telephone No.: (033) 502-4953',
      bank: 'PNB',
      preparedBy: 'JESSA MAE DEPITA',
      checkedBy: GM,
      approvedBy: 'MANUEL DOLAR',
    },
  }),
  mk({
    id: 'recovery', label: 'RECOVERY SPA', logo: 'recovery.png', showTin: true, start: 300,
    defaults: {
      address: 'Blgd G & R, M.H. Del Pilar St. Brgy. Taal, Molo, Iloilo City',
      phone: 'Telephone No.: 09853359998',
      bank: "PRODUCER'S BANK",
      preparedBy: 'MECAH P. PADERNAL',
    },
  }),
  mk({
    id: 'multipliers', label: 'MULTIPLIERS', logo: 'multipliers.png', logoPos: 'left', showTin: true, start: 1099,
    defaults: {
      address: 'Greenfield, Diversion Road Mandurriao, Iloilo City',
      phone: 'Telephone No.: (033) 338-9995',
      bank: '',
      preparedBy: 'DARLENE GEE SALANATIN',
    },
  }),
  mk({
    id: 'hero', label: 'HERO', logo: 'hero.png', showTin: true, start: 550,
    defaults: {
      address: 'Diversion Road Mandurriao, Iloilo City',
      phone: 'Telephone No.: (033) 338-9995',
      bank: 'METROBANK',
      preparedBy: 'TERESA T. BACAY',
    },
  }),
  mk({
    id: 'personal', label: 'PERSONAL (MxM)', logo: 'personal.png', showTin: true, start: 139,
    defaults: {
      address: 'Diversion Road Mandurriao, Iloilo City',
      phone: 'Telephone No.: (033) 338-9995',
      bank: '',
      preparedBy: 'CLARIBEL MOQUETE',
    },
  }),
]