// Imports
const https = require("https");
const fs = require("fs");
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
// const { PrismaClient } = require('./generated/prisma');

dotenv.config();

const SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

// Initialize Prisma
// const prisma = new PrismaClient();

// Configuração multer
const uploadConfig = require("./config/multer");
const upload = multer(uploadConfig.upload("./tmp-sema"));

// Middleware de Autenticação da rota ADM
const { authenticateADM, authenticateLowuser, authenticateAdminOrLowuser } = require("./middlewares/adminAuth");

// Express server setup
const app = express();
const port = 8080;

app.use(cors());
app.use(express.static("public"));

app.use(session({
  secret: "K_*&$lpUTR@!çPÇ0524.nup",
  cookie: { maxAge: 1800000 }
}));

// Configuração ejs
app.set("view engine", "ejs");

// Configuração body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Middleware for /tmp authentication
app.get('/tmp/*', (req, res, next) => {
  const filePath = path.join(__dirname, 'tmp-sema', req.params[0]);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send('Arquivo não encontrado');
    }
  });
});


app.get("/select/:id", async (req, res) => {
  const id = parseInt(req.params.id); // converte para número
  console.log(id);

  const user = await prisma.user.findFirst({
    where: { id: id }
  });

  res.render("sema/moldeone.ejs", { user: user });
});



app.get("/", (req, res) => {
  res.render("sema/index.ejs");
});

app.get("/controller", authenticateADM, async(req, res) => {
  const candidates = await prisma.user.findMany();
  res.render("sema/admin.ejs", {candidates:candidates})
});

app.get("/controller/lowuser", authenticateLowuser, (req, res) => {
  res.render("sema/lowuser.ejs")
});

app.get("/search", (req, res) => {
  res.render("saude/searchIndex.ejs");
});

app.get("/login", (req, res) => {
  res.render("sema/login.ejs")

})
app.get("/teste", (req, res) => {
  res.render("sema/teste.ejs")

})


app.post("/admin/create", async(req, res) => {
  const { name, user_name, password } = req.body;
  const roles = "admin"

  const hash = await bcryptjs.hash(password, 10);


  const createUser = await prisma.admin.create({data:{name, user_name, password:hash, roles:roles}})
  

  res.json({menssage: "Usuário criado com sucesso!"})
});

app.post("/authenticate", async (req, res) => {
  try {

    let { username, password } = req.body;

    console.log(username, password)

    // Procurar o usuário pelo nome
    const user = await prisma.admin.findFirst({ where: { user_name: username } });

    if (user) {
      // Comparar a senha fornecida com a senha criptografada no banco
      const comparison = await bcryptjs.compare(password, user.password);


      console.log(comparison)


      if (comparison) {
        // Se a senha for correta, salvar os dados do usuário na sessão
        req.session.user = {
          id: user.id,
          name: user.name,
          roles: user.roles,
        };

        // Verificar se a sessão do usuário está definida antes de acessar o nome
        if (req.session.user) {
          console.log("Sessão de usuário encontrada.");
        } else {
          console.log("Sessão de usuário não encontrada.");
        }

        // Verificar o papel do usuário e redirecionar
        if (req.session.user.roles === 'admin') {
          res.redirect("/controller");
        } else if (req.session.user.roles === 'lowuser') {
          res.redirect("/controller/lowuser");
        } else {
          return res.status(403).send("Função de usuário inválida");
        }

      } else {
        // Senha incorreta
        res.redirect("/controller");
      }
    } else {
      // Usuário não encontrado
      res.redirect("/controller");
    }
  } catch (error) {
    console.error('Erro ao autenticar usuário:', error);
    res.status(500).send("Erro interno no servidor.");
  }
});
// Formatting functions
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

// Form processing route
app.post("/send", upload.single("file"), async (req, res) => {
  try {
    console.log("Arquivo recebido:", req.file);

    // Generate protocol number
    const data = new Date();
    const fullYear = data.getFullYear();
    const day = String(data.getDate()).padStart(2, '0');
    const month = String(data.getMonth() + 1).padStart(2, '0');
    const digt = Math.floor(Math.random() * 900000) + 100000;
    const protocolhasg = `${fullYear}${month}${day}${digt}`;


    function getPositionType(position) {
  switch (position) {
    case "ANALISTA_ENGENHEIRO_CIVIL":
    case "ANALISTA_ENGENHEIRO_CALCULISTA":
    case "ANALISTA_ENGENHEIRO_AMBIENTAL":
    case "ANALISTA_ENGENHEIRO_FLORESTAL":
    case "ANALISTA_ENGENHEIRO_QUIMICO_INDUSTRIAL":
    case "ANALISTA_GEOLOGO":
      return 1; // Analista
    case "TECNICO_AMBIENTAL_EDIFICACOES":
      return 2; // Técnico
    default:
      return null; // Caso nenhuma opção válida seja selecionada
  }
}

    // Extract form data
    const {
      name, cpf, birth, rg, organ, uf, title, military, nationality, proficiency,
      email, tel, zip, address, housenumber, housecomplement, neighborhood, city,
      ufresidence, position, education, course, council, councilnumber, experience,
      deficiency, deficiencyContext, accumulation, accumulationInfo, term
    } = req.body;

    // Convert term to boolean
    const formattedTerm = term === 'on' ? true : false;

    // Format fields
    const formattedCPF = formatCPF(cpf.replace(/\D/g, ''));
    const formattedBirth = formatDate(birth);
    const formattedPhone = formatPhone(tel);
    const formattedCEP = formatCEP(zip.replace(/\D/g, ''));
    const formattedTitle = formatTituloEleitor(title.replace(/\D/g, ''));
    const formattedRG = formatRG(rg.replace(/\D/g, ''));

    // CPF validation
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

    // File validation
    const file = req.file;
    if (!file) {
      return res.status(400).render("sema/unsuccessful.ejs", {
        error: "Nenhum arquivo PDF foi enviado!",
        name: name
      });
    }
    const nameFile = file.filename;
    const filePath = path.join(__dirname, 'tmp-sema', nameFile);

    // Check if CPF already exists for the position
    const userExistByCPF = await prisma.user.findFirst({
      where: {
        position,
        cpf: formattedCPF
      }
    });

    if (userExistByCPF) {
      return res.status(400).render("sema/unsuccessful.ejs", {
        error: "Este CPF já está cadastrado para essa vaga",
        name: name
      });
    }

    console.log(getPositionType(1))
    // Save to database
    const user = await prisma.user.create({
      data: {
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
        housecomplement: housecomplement || null,
        neighborhood,
        city,
        ufresidence,
        position,
        education,
        course,
        council,
        councilnumber,
        experience: parseInt(experience),
        deficiency,
        deficiencyContext: deficiency === 'SIM' ? deficiencyContext : 'NÃO TENHO',
        accumulation,
        accumulationInfo: accumulation === 'ACUMULO' ? accumulationInfo : 'NÃO ACUMULO',
        term: formattedTerm,
        description: null,
        isValid: false,
        notice: null,
        regraId: getPositionType(1)
      }
    });

    // Email configuration
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "dev.kaiolima@gmail.com",
        pass: "qtfi agek iqvg vowa"
      }
    });

    // Email content
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
          <tr><td><strong>Candid Selection:</strong></td><td>${name.toUpperCase()}</td></tr>
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

    // Send email
    await transporter.sendMail(mailOptions);

    // Render success page
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
  } finally {
    await prisma.$disconnect();
  }
});


app.use((req, res) => {
  res.redirect("/");
});

// Start server
app.listen(8082, () => {
  console.log("servidor rodando.");
});