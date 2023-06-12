import { genXLSX } from '@services/xlsx_template';
import express from 'express';
import multer from 'multer';
import { readFile, readdir, unlink } from "fs-extra";
var upload = multer({
  storage: multer.diskStorage({
    destination: function (_req, file, cb) {
      if (file.fieldname === "file") {
        cb(null, './uploads/xlsx/')
      }
      else if (file.fieldname === "tepdinhkem") {
        cb(null, './uploads/tepdinhkem/');
      }
      else if (file.fieldname === "template") {
        cb(null, './uploads/template/');
      }
      else {
        cb(null, './uploads/unknown/');
      }
    },
    filename: function (_req, file, cb) {
      // cb(null, `${path.basename(file.originalname)}_${Date.now()}${path.extname(file.originalname)}`);
      cb(null, `${file.originalname.normalize("NFD").replace(/\p{Diacritic}/gu, "").replaceAll('đ', 'd').replaceAll(' ', '')}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    file.originalname = Buffer.from(file.originalname, 'latin1').toString(
      'utf8'
    )
    cb(null, true)
  },
});
const router = express.Router();
router.post('/ping', upload.single('file'), async function (_req, res) {
  res.status(200).send("Service is up and running!")
})

router.post('/template/upload', upload.single('template'), async function (req, res) {
  console.log(req.file)
  res.status(200).send(req.file)
})

router.get('/template/list', upload.single('template'), async function (req, res) {
  let dir = await readdir('uploads/template')
  res.status(200).send(dir)
})

router.post('/template/', upload.single('template'), async function (req, res) {
  const filePath = `uploads/template/${req?.body?.fileName}`
  try {
    let file = await readFile(filePath)
    res.writeHead(200, {
      'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      'Content-disposition': 'attachment;filename=' + encodeURI(req?.body?.fileName),
      'Content-Length': file.length
    });
    res.end(file);
  } catch (error) {
    console.log(error);
    res.status(500).send(error)
  }
})

router.delete('/template/', upload.single('template'), async function (req, res) {
  const filePath = `uploads/template/${req?.body?.fileName}`
  let status = await unlink(filePath)
  res.status(200).send(status)
})

router.post('/xlsx', async function (req, res) {
  const dataXLSX = req?.body?.xlsxData
  const responseFileName = req?.body?.responseFileName || `${new Date().getTime()}.xlsx`
  let responseFilePath = await genXLSX(req?.body?.templateName, dataXLSX)
  if (responseFilePath) {
    try {
      let file = await readFile(responseFilePath)
      res.writeHead(200, {
        'Content-Type': "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        'Content-disposition': 'attachment;filename=' + encodeURI(responseFileName),
        'Content-Length': file.length
      });
      await unlink(responseFilePath)
      res.end(file);
    } catch (error) {
      console.log(error);
      res.status(500).send(error)
    }
  }
  else {
    res.status(500).send({
      errMessage: "No file generated!"
    })
  }

})
export default router