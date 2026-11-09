# Check Voucher Maker (Demic Atria)

    npm install
    npm run dev      # open the printed localhost link
    npm test         # checks the numbering logic

- Enter **From No.** and **To No.** (e.g. 401-420). 2 vouchers print per sheet.
- Numbering is cut-and-stack: sheet 1 = 401 top / 411 bottom, sheet 2 = 402 / 412 ... sheet 10 = 410 / 420.
  Cut the printed stack in half and each pile is already in order.
- Click any field on a voucher to edit it (payee, amount lines, check no., bank...). Amount and
  "Cash in Bank" totals update automatically. Edits are saved in the browser.
- Print uses the paper chosen on the left (long bond / letter / A4). Turn off "Headers and footers" in the print dialog.
