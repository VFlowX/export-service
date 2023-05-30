import xltpl from 'xltpl'

export async function genXLSX(templateName: string, sheetData: any) {
  try {
    let writer = new xltpl();
    let now = new Date().getTime();
    await writer.readFile(`uploads/template/${templateName}`);
    await writer.renderSheets(sheetData)
    await writer.save(`uploads/xlsx/result_${templateName}_${now}.xlsx`);
    return `uploads/xlsx/result_${templateName}_${now}.xlsx`
  } catch (error) {
    console.log(error);
  }
}