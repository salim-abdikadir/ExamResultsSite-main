const xlsx = require("xlsx");

const readExcelController = function (path) {
  const workbook = xlsx.readFile(path); // Step 2
  let workbook_sheet = workbook.SheetNames; // Step 3
  let workbook_response = xlsx.utils.sheet_to_json(
    // Step 4
    workbook.Sheets[workbook_sheet[0]]
  );
  return workbook_response;
};

module.exports = readExcelController;
