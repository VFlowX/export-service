import 'dotenv/config'
import bodyParser from 'body-parser';
import https from 'https';
import express from 'express';
import * as fs from 'fs-extra'
import exportRouter from "@routes/exportXLSX";


https.globalAgent.options.rejectUnauthorized = false;

const app = express();
app.use(bodyParser.json({
  limit: "50mb"
}));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use((err: any, _req: any, res: any, _next: any) => {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err,
  });
});

fs.ensureDir('uploads/template/')
fs.ensureDir('uploads/xlsx/')
app.use('/export', exportRouter)
app.listen(9000, async () => {
  console.log("Server is up! http://0.0.0.0:9000");
})
