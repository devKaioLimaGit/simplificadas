// Importes:
const https = require("https")
const cors = require('cors');
const express = require("express");
const dotenv = require("dotenv");

dotenv.config();


const app = express();

// Porta da aplicação
const port = 8080;


// É um mecanismo que permite que aplicações web interajam com recursos de outros domínios. 
app.use(cors());


// Caminhos dos arquivos do Let's Encrypt (certificados) --> ("FAZ TUA MÁGICA MAGO...")
// const sslOptions = {
//   key: fs.readFileSync("/etc/letsencrypt/live/simplificada.saude.paulista.pe.gov.br/privkey.pem"),
//   cert: fs.readFileSync("/etc/letsencrypt/live/simplificada.saude.paulista.pe.gov.br/fullchain.pem"),
//   ca: fs.readFileSync("/etc/letsencrypt/live/simplificada.saude.paulista.pe.gov.br/chain.pem")
// };

app.use(express.static("public"));


// Configuração ejs:
app.set("view engine", "ejs");


app.get("/", (req,res)=>{
  res.render("simplificadas/index.ejs")
})

app.use((req, res) => { 
  res.redirect("/")
})



// Inicia o servidor HTTPS usando os certificados SSL do Let's Encrypt
// https.createServer(sslOptions, app).listen(8080, () => {
//   console.log(`Servidor HTTPS rodando na porta ${8080}`);
// });

app.listen(8080, ()=>{
  console.log("servidor rodando.")
})