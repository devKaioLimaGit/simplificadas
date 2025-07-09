// Importes:
const https = require("https")
const fs = require("fs")
const cors = require('cors');
const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const bcryptjs = require('bcryptjs');
const path = require("path");
const session = require('express-session');
const nodemailer = require("nodemailer");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;


// Conexão com o banco:

const connection = require("./database/bankconnection-sema");
const User = require("./model/sema/user/User");

// Sincronizar o modelo com o banco
(async () => {
  try {
    await connection.sync({ force: false }); // force: false evita recriar a tabela se ela já existir
    console.log("Tabela User sincronizada com sucesso!");
  } catch (error) {
    console.error("Erro ao sincronizar a tabela:", error);
  }
})();


// Configuração multer:
const uploadConfig = require("./config/multer");
const upload = multer(uploadConfig.upload("./tmp-sema"));


// Middleware de Autenticação da rota ADM:
const { authenticateADM, authenticateLowuser, authenticateAdminOrLowuser } = require("./middlewares/adminAuth");
const { where } = require("sequelize");


// Variavel com funcionalidades do express servidor:
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



app.use(session({
  secret: "K_*&$lpUTR@!çPÇ0524.nup",
  cookie: { maxAge: 1800000 }
}));

// Configuração ejs:
app.set("view engine", "ejs");

// Configuração body-parser:
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



// Middleware de autenticação para '/tmp'
app.get('/tmp/*', authenticateAdminOrLowuser, (req, res, next) => {
  // Define o caminho real para o arquivo
  const filePath = path.join(__dirname, 'tmp', req.params[0]);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send('Arquivo não encontrado');
    }
  });
});

app.get("/", (req, res) => {
  res.render("sema/index.ejs")
});


// Funções de formatação
function formatCPF(cpf) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formatPhone(phone) {
  const cleanedPhone = phone.replace(/\D/g, '');
  let phoneNumber = cleanedPhone;
  if (cleanedPhone.length === 13) {
    const countryCode = cleanedPhone.slice(0, 2);
    phoneNumber = cleanedPhone.slice(2);
    return `+${countryCode} (${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7)}`;
  } else if (cleanedPhone.length === 11) {
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7)}`;
  } else {
    return "Número inválido";
  }
}

function formatDate(date) {
  return date.replace(/(\d{4})-(\d{2})-(\d{2})/, "$3-$2-$1");
}

function formatCEP(cep) {
  return cep.replace(/(\d{5})(\d{3})/, "$1-$2");
}

function formatTituloEleitor(titulo) {
  return titulo.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3");
}

function formatRG(rg) {
  return rg.replace(/(\d{2})(\d{3})(\d{3})/, "$1.$2.$3");
}

// Rota para processar o formulário
app.post("/send", upload.single("file"), async (req, res) => {
  try {
    console.log("Arquivo recebido:", req.file);

    // Gerar número de protocolo
    const data = new Date();
    const fullYear = data.getFullYear();
    const day = String(data.getDate()).padStart(2, '0');
    const month = String(data.getMonth() + 1).padStart(2, '0');
    const digt = Math.floor(Math.random() * 900000) + 100000;
    const protocolhasg = `${fullYear}${month}${day}${digt}`;

    // Extrair dados do formulário
    const {
      name, cpf, birth, rg, organ, uf, title, military, nationality, proficiency,
      email, tel, zip, address, housenumber, housecomplement, neighborhood, city,
      ufresidence, position, education, course, council, councilnumber, experience,
      deficiency, deficiencyContext, accumulation, accumulationInfo, term
    } = req.body;

    // Converter term para booleano
    const formattedTerm = term === 'on' ? true : false;

    // Formatando os campos
    const formattedCPF = formatCPF(cpf.replace(/\D/g, ''));
    const formattedBirth = formatDate(birth);
    const formattedPhone = formatPhone(tel);
    const formattedCEP = formatCEP(zip.replace(/\D/g, ''));
    const formattedTitle = formatTituloEleitor(title.replace(/\D/g, ''));
    const formattedRG = formatRG(rg.replace(/\D/g, ''));

    // Validação do CPF
    function isValidCPF(cpf) {
      let sum = 0, rest;
      if (cpf === "00000000000") return false;
      for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
      rest = (sum * 10) % 11;
      if (rest === 10 || rest === 11) rest = 0;
      if (rest !== parseInt(cpf.substring(9, 10))) return false;
      sum = 0;
      for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
      rest = (sum * 10) % 11;
      if (rest === 10 || rest === 11) rest = 0;
      if (rest !== parseInt(cpf.substring(10, 11))) return false;
      return true;
    }

    if (!isValidCPF(cpf.replace(/\D/g, ''))) {
      return res.status(400).render("sema/unsuccessful.ejs", {
        error: "CPF inválido",
        name: name
      });
    }

    // Validação do arquivo
    const file = req.file;
    if (!file) {
      return res.status(400).render("sema/unsuccessful.ejs", {
        error: "Nenhum arquivo PDF foi enviado!",
        name: name
      });
    }
    const nameFile = file.filename;
    const filePath = path.join(__dirname, 'tmp-sema', nameFile);

    // Verificar se o CPF já está cadastrado para a mesma vaga
    const userExistByCPF = await User.findOne({
      where: {
        position: position,
        cpf: formattedCPF
      }
    });

    if (userExistByCPF) {
      return res.status(400).render("sema/unsuccessful.ejs", {
        error: "Este CPF já está cadastrado para essa vaga",
        name: name
      });
    }

    // Salvar no banco de dados
    const user = await User.create({
      protocol: protocolhasg,
      filename: nameFile,
      name,
      cpf: formattedCPF,
      birth: formattedBirth,
      rg: formattedRG,
      organ,
      uf,
      title: formattedTitle,
      military,
      nationality,
      proficiency,
      email,
      tel: formattedPhone,
      zip: formattedCEP,
      address,
      housenumber,
      housecomplement,
      neighborhood,
      city,
      ufresidence,
      position,
      education,
      course,
      council,
      councilnumber,
      experience,
      deficiency,
      deficiencyContext: deficiency === 'SIM' ? deficiencyContext : 'NÃO TENHO',
      accumulation,
      accumulationInfo: accumulation === 'ACUMULO' ? accumulationInfo : 'NÃO ACUMULO',
      term: formattedTerm,
      description: null,
      isValid: false,
      notice: null
    });

    // Configuração do transporte de e-mail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "dev.kaiolima@gmail.com",
        pass: "qtfi agek iqvg vowa" // Senha de app gerada pelo Google
      }
    });

    // Conteúdo do e-mail
    const htmlContent = `
      <h1>PORTARIA CONJUNTA SECAD/SEMA Nº 001/2025</h1>
      <br/>
      <h2>Dados de Inscrição do Candidato: ${name.toUpperCase()}</h2>
      <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 800px;">
        <thead>
          <tr>
            <th style="background-color: #f2f2f2; text-align: left;">Campo</th>
            <th style="background-color: #f2f2f2; text-align: left;">Dados</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>Nº Inscrição:</strong></td><td>${protocolhasg.toUpperCase()}</td></tr>
          <tr><td><strong>Candidato:</strong></td><td>${name.toUpperCase()}</td></tr>
          <tr><td><strong>CPF:</strong></td><td>${formattedCPF}</td></tr>
          <tr><td><strong>Data de Nascimento:</strong></td><td>${formattedBirth}</td></tr>
          <tr><td><strong>RG:</strong></td><td>${formattedRG}</td></tr>
          <tr><td><strong>Órgão Emissor:</strong></td><td>${organ.toUpperCase()}</td></tr>
          <tr><td><strong>UF do RG:</strong></td><td>${uf.toUpperCase()}</td></tr>
          <tr><td><strong>Título de Eleitor:</strong></td><td>${formattedTitle}</td></tr>
          <tr><td><strong>Quitação com Serviço Militar:</strong></td><td>${military.toUpperCase()}</td></tr>
          <tr><td><strong>Nacionalidade:</strong></td><td>${nationality.toUpperCase()}</td></tr>
          <tr><td><strong>Certificado de Proficiência:</strong></td><td>${proficiency.toUpperCase()}</td></tr>
          <tr><td><strong>E-mail:</strong></td><td>${email.toLowerCase()}</td></tr>
          <tr><td><strong>Telefone:</strong></td><td>${formattedPhone}</td></tr>
          <tr><td><strong>CEP:</strong></td><td>${formattedCEP}</td></tr>
          <tr><td><strong>Endereço:</strong></td><td>${address.toUpperCase()}</td></tr>
          <tr><td><strong>Número:</strong></td><td>${housenumber}</td></tr>
          <tr><td><strong>Complemento:</strong></td><td>${housecomplement ? housecomplement.toUpperCase() : 'NÃO INFORMADO'}</td></tr>
          <tr><td><strong>Bairro:</strong></td><td>${neighborhood.toUpperCase()}</td></tr>
          <tr><td><strong>Cidade:</strong></td><td>${city.toUpperCase()}</td></tr>
          <tr><td><strong>UF do Endereço:</strong></td><td>${ufresidence.toUpperCase()}</td></tr>
          <tr><td><strong>Função:</strong></td><td>${position.toUpperCase()}</td></tr>
          <tr><td><strong>Escolaridade:</strong></td><td>${education.toUpperCase()}</td></tr>
          <tr><td><strong>Curso de Formação:</strong></td><td>${course.toUpperCase()}</td></tr>
          <tr><td><strong>Conselho de Classe:</strong></td><td>${council.toUpperCase()}</td></tr>
          <tr><td><strong>Número de Registro no Conselho:</strong></td><td>${councilnumber}</td></tr>
          <tr><td><strong>Tempo de Experiência Profissional (meses):</strong></td><td>${experience}</td></tr>
          <tr><td><strong>Pessoa com Deficiência:</strong></td><td>${deficiency.toUpperCase()}</td></tr>
          <tr><td><strong>Detalhes da Deficiência:</strong></td><td>${deficiency === 'SIM' ? deficiencyContext.toUpperCase() : 'NÃO TENHO'}</td></tr>
          <tr><td><strong>Declaração de Acumulação:</strong></td><td>${accumulation.toUpperCase()}</td></tr>
          <tr><td><strong>Detalhes da Acumulação:</strong></td><td>${accumulation === 'ACUMULO' ? accumulationInfo.toUpperCase() : 'NÃO ACUMULO'}</td></tr>
        </tbody>
      </table>
    `;

    const mailOptions = {
      from: "dev.kaiolima@gmail.com",
      to: `${email}, simplificada.meioambiente@paulista.pe.gov.br`,
      subject: "Inscrição Realizada com Sucesso - Processo Seletivo Meio Ambiente",
      html: htmlContent,
      attachments: [
        {
          filename: nameFile,
          path: filePath
        }
      ]
    };

    // Enviar e-mail
    await transporter.sendMail(mailOptions);

    // Renderizar página de sucesso
    res.render("sema/success.ejs", {
      protocolo: protocolhasg,
      name: name,
      cargo: position,
      filename: nameFile
    });

  } catch (err) {
    console.error(err);
    res.status(400).render("sema/error.ejs", {
      error: "Erro ao processar a inscrição: " + err.message
    });
  }
});




app.get("/search", (req, res) => {
  res.render("saude/searchIndex.ejs");
});

app.use((req, res) => {
  res.redirect("/")
})








// Inicia o servidor HTTPS usando os certificados SSL do Let's Encrypt
// https.createServer(sslOptions, app).listen(8080, () => {
//   console.log(`Servidor HTTPS rodando na porta ${8080}`);
// });

app.listen(8082, () => {
  console.log("servidor rodando.")
})