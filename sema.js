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
const connection = require("./database/bankconnection");

// Tabelas do Banco de Dados:
const Admin = require("./model/admin/Adimin");
const User = require("./model/user/User");
const Logs = require("./model/Logs/Logs");

// Configuração multer:
const uploadConfig = require("./config/multer");
const upload = multer(uploadConfig.upload("./tmp"));


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

// Middleware to log only the IP address for every request
// app.use(async (req, res, next) => {
//   try {
//     // Extract the IP address from the request
//     const ip = req.ip;

//     // Create a simple description with only the IP
//     const action = `${req.method} ${req.originalUrl}`; // e.g., "GET /" or "POST /send"
//     const description = `Requisição realizada por IP: ${ip}`;

//     // Determine adminId or userId based on session (if available)
//     const adminId = req.session.user && req.session.user.roles === 'admin' ? req.session.user.id : null;
//     const userId = req.session.user && req.session.user.roles === 'lowuser' ? req.session.user.id : null;

//     // Save log entry to the database
//     await Logs.create({
//       action,
//       description,
//       adminId,
//       userId,
//     });

//     // Proceed to the next middleware or route handler
//     next();
//   } catch (error) {
//     console.error("Erro ao registrar log:", error);
//     // Even if logging fails, proceed to the next handler to avoid blocking the request
//     next();
//   }
// });

app.set('trust proxy', true);

app.use(async (req, res, next) => {
  try {
    // Extrai o IP real do cliente, pegando o primeiro da lista se houver múltiplos
    const ip = (req.headers['x-forwarded-for'] || req.ip).split(',')[0].trim();

    // Create a simple description with only the IP
    const action = `${req.method} ${req.originalUrl}`;
    const description = `Requisição realizada por IP: ${ip}`;

    // Determine adminId or userId based on session (if available)
    const adminId = req.session.user && req.session.user.roles === 'admin' ? req.session.user.id : null;
    const userId = req.session.user && req.session.user.roles === 'lowuser' ? req.session.user.id : null;

    // Save log entry to the database
    await Logs.create({
      action,
      description,
      adminId,
      userId,
    });

    next();
  } catch (error) {
    console.error("Erro ao registrar log:", error);
    next();
  }
});

// Corrigindo a rota GET para renderizar a página corretamente
app.get("/", (req, res) => {
  res.render("saude/index.ejs");
});

//Rota de termos
app.get("/terms", (req, res) => {
  res.render("saude/terms.ejs")
})

// Rota para upload de arquivo
app.post("/send", upload.single("file"), async (req, res) => {
  // Função para formatar CPF (12345678901 → 123.456.789-01)
  function formatCPF(cpf) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  // Função para formatar telefone (81985801560 → (81) 98580-1560)
  function formatPhone(phone) {
    const cleanedPhone = phone.replace(/\D/g, '');
    return cleanedPhone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  // Função para formatar data (2002-10-31 → 31-10-2002)
  function formatDate(date) {
    return date.replace(/(\d{4})-(\d{2})-(\d{2})/, "$3-$2-$1");
  }

  // Função para formatar CEP (12345678 → 12345-678)
  function formatCEP(cep) {
    return cep.replace(/(\d{5})(\d{3})/, "$1-$2");
  }

  // Função para formatar PIS (12345678901 → 123.45678.90-1)
  function formatPIS(pis) {
    return pis.replace(/(\d{3})(\d{5})(\d{2})(\d{1})/, "$1.$2.$3-$4");
  }

  // Função para formatar Título de Eleitor (123456789012 → 1234 5678 9012)
  function formatTituloEleitor(titulo) {
    return titulo.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3");
  }

  // Função para formatar RG (assumindo que será algo como 1234567 → 1.234.567)
  function formatRG(rg) {
    return rg.replace(/(\d{1})(\d{3})(\d{3})/, "$1.$2.$3");
  }




  try {
    const data = new Date();
    const fullYear = data.getFullYear();
    const day = data.getDate();  // Corrigido para obter o dia do mês
    const month = data.getMonth() + 1;  // Corrigido para que o mês seja 1 a 12, não 0 a 11
    const digt = Math.floor(Math.random() * 900000) + 100000;  // Corrigido para gerar um número de 6 dígitos
    const protocolhasg = `${fullYear}${month}${day}${digt}`;




    const {
      // recaptchaToken,
      name,
      cpf,
      birth,
      ageinyears,
      gender,
      rg,
      organ,
      uf,
      title,
      pis,
      civilstatus,
      education,
      mother,
      nationality,
      cityofbirth,
      birthplacestate,
      raceandcolor,
      bloodtype,
      email,
      tel,
      zip,
      address,
      housenumber,
      housecomplement,
      neighborhood,
      city,
      position,
      experience,
      experienceExit,
      advice,
      registrationCouncil,
      deficiency,
      deficiencyContext,
      jury,
      term,
    } = req.body;


    // Formatando os campos antes de salvar
    const formattedCPF = formatCPF(cpf.replace(/\D/g, '')); // Remove caracteres não numéricos antes de formatar
    const formattedBirth = formatDate(birth);
    const formattedPhone = formatPhone(tel);
    const formattedCEP = formatCEP(zip.replace(/\D/g, ''));
    const formattedPIS = formatPIS(pis.replace(/\D/g, ''));
    const formattedTitle = formatTituloEleitor(title.replace(/\D/g, ''));


    // Verificar token do reCAPTCHA no Google
    // const response = await axios.post(
    //   `https://www.google.com/recaptcha/api/siteverify`,
    //   null,
    //   {
    //     params: {
    //       secret: SECRET_KEY,
    //       response: recaptchaToken
    //     }
    //   }
    // );


    // const { success, score } = response.data;

    // if (!success || score < 0.5) {
    //   return res.render("saude/errorrecaptcha.ejs");
    // }


    const userExist = await User.findOne({ where: { cpf } });

    if (userExist) {
      return res.status(400).json(res.render("saude/unsuccessful.ejs", { name: name }));

    }

    // Verificação do arquivo APÓS validar usuário
    const file = req.file;
    const nameFile = req.file.filename

    if (!file) {
      return res.status(400).json({ error: "Nenhum arquivo foi enviado!" });
    }

    // Criando o usuário no banco de dados com os campos formatados
    const user = await User.create({
      protocol: protocolhasg,
      filename: nameFile,
      name,
      cpf: formattedCPF,
      birth: formattedBirth,
      ageinyears,
      gender,
      rg,
      organ,
      uf,
      title: formattedTitle,
      pis: formattedPIS,
      civilstatus,
      education,
      mother,
      nationality,
      cityofbirth,
      birthplacestate,
      raceandcolor,
      bloodtype,
      email,
      tel: formattedPhone,
      zip: formattedCEP,
      address,
      housenumber,
      housecomplement,
      neighborhood,
      city,
      position,
      experience,
      experienceExit,
      advice,
      registrationCouncil,
      deficiency,
      deficiencyContext,
      jury,
      term,
    });

    // Configuração do transporte de e-mail
    const transporter = nodemailer.createTransport({
      host: "mail.paulista.pe.gov.br",
      port: 465,
      secure: true,
      tls: { rejectUnauthorized: false },
      auth: {
        user: "simplificada.saude@paulista.pe.gov.br",
        pass: "$Mudar@2025!#",
      },
    });

    const htmlContent = `
        <h1>PORTARIA CONJUNTA SECAD/SESAU N° 001/2025 - Decreto Municipal Nº 008/2025 e Nº 013/2025</h1>
        <br/>
        <h2>Dados de inscrição do candidáto: ${name}</h2>
        <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 800px;">
          <thead>
            <tr>
              <th style="background-color: #f2f2f2; text-align: left;">Campo</th>
              <th style="background-color: #f2f2f2; text-align: left;">Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>N° Protocolo:</strong></td><td>${protocolhasg.toLocaleUpperCase()}</td></tr>
            <tr><td><strong>Nome Completo do Cadidato:</strong></td><td>${name.toLocaleUpperCase()}</td></tr>
            <tr><td><strong>CPF:</strong></td><td>${formatCPF(cpf)}</td></tr>
            <tr><td><strong>Data de Nascimento:</strong></td><td>${formatDate(birth)}</td></tr>
            <tr><td><strong>Idade do candidato no ano de inscrição:</strong></td><td>${ageinyears} anos</td></tr>
            <tr><td><strong>Gênero Sexual:</strong></td><td>${gender.toLocaleUpperCase()}</td></tr>
            <tr><td><strong>RG:</strong></td><td>${rg}</td></tr>
            <tr><td><strong>Orgão Emissor:</strong></td><td>${organ.toLocaleUpperCase()}</td></tr>
            <tr><td><strong>UF:</strong></td><td>${uf.toLocaleUpperCase()}</td></tr>
            <tr><td><strong>Título de Eleitor:</strong></td><td>${title.toLocaleUpperCase()}</td></tr>
            <tr><td><strong>Número do PIS:</strong></td><td>${pis.toLocaleUpperCase()}</td></tr>
            <tr><td><strong>Estado Civil:</strong></td><td>${civilstatus.toLocaleUpperCase()}</td></tr>
            <tr><td><strong>Escolaridade:</strong></td><td>${education.toLocaleUpperCase()}</td></tr>
            <tr><td><strong>Nome Completo da Mãe:</strong></td><td>${mother.toLocaleUpperCase()}</td></tr>
            <tr><td><strong>Nacionalidade:</strong></td><td>${nationality.toLocaleUpperCase()}</td></tr>
            <tr><td><strong>Naturalidade Cidade:</strong></td><td>${cityofbirth.toLocaleUpperCase()}</td></tr>
            <tr><td><strong>E-mail:</strong></td><td>${email.toLocaleUpperCase().toLocaleUpperCase()}</td></tr>
            <tr><td><strong>Naturalidade Estado:</strong></td><td>${birthplacestate.toLocaleUpperCase()}</td></tr>
            <tr><td><strong>RAÇA/COR:</strong></td><td>${raceandcolor.toLocaleUpperCase()}</td></tr>
            <tr><td><strong>Tipo Sanguíneo:</strong></td><td>${bloodtype.toLocaleUpperCase()}</td></tr>
            <tr><td><strong>Telefone:</strong></td><td>${formatPhone(tel)}</td></tr>
            <tr><td><strong>CEP:</strong></td><td>${formatCEP(zip)}</td></tr>
            <tr><td><strong>Endereço:</strong></td><td>${address.toLocaleUpperCase()}</td></tr>
            <tr><td><strong>Número:</strong></td><td>${housenumber.toLocaleUpperCase()}</td></tr>
            <tr><td><strong>Complemento:</strong></td><td>${housecomplement.toLocaleUpperCase()}</td></tr>
            <tr><td><strong>Bairro:</strong></td><td>${neighborhood.toLocaleUpperCase()}</td></tr>
            <tr><td><strong>Cidade:</strong></td><td>${city.toLocaleUpperCase()}</td></tr>            
            <tr><td><strong>Cargo Pretendido:</strong></td><td>${position.toLocaleUpperCase()}</td></tr>
            <tr><td><strong>Tempo de Experiência Profissional (No SUS):</strong></td><td>${experience}</td></tr>
            <tr><td><strong>Tempo de Experiência Profissional (Fora do SUS)</strong></td><td>${experienceExit.toLocaleUpperCase()}</td></tr>
            <tr><td><strong>Conselho de Classe:</strong></td><td>${advice.toLocaleUpperCase()}</td></tr>
            <tr><td><strong>Número de Registro no Conselho de Classe:</strong></td><td>${registrationCouncil.toLocaleUpperCase()}</td></tr>
            <tr><td><strong>Pessoa com Deficiência:</strong></td><td>${deficiency.toLocaleUpperCase()}</td></tr>
            <tr><td><strong>Se SIM, especifique a deficiência. Se Não, digite: NÃO TENHO:</strong></td><td>${deficiencyContext.toLocaleUpperCase()}</td></tr>
            <tr><td><strong>Já atuou como Jurado em Tribunal do Júri:</strong></td><td>${jury.toLocaleUpperCase()}</td></tr>
          </tbody>
        </table>
      `;

    const mailOptions = {
      from: "simplificada.saude@paulista.pe.gov.br",
      to: `${email}, dev.kaiolima@gmail.com, kaiolima.asus@gmail.com,simplificada.saude@paulista.pe.gov.br`,
      subject: "Inscrição realizada com sucesso!",
      html: htmlContent,
      attachments: [
        {
          filename: `${cpf}.pdf`,
          path: path.join(__dirname, "tmp", `${cpf}.pdf`),
        },
      ],
    };

    let emailResponse;
    try {
      await transporter.sendMail(mailOptions);
      emailResponse = "E-mail enviado com sucesso!";
    } catch (error) {
      emailResponse = "Erro ao enviar e-mail: " + error.message;
    }

    res.render("saude/success.ejs", { protocolo: protocolhasg, name: name, cargo: position });

  } catch (err) {
    // return res.status(400).json(err);
    return res.status(400).render("saude/error.ejs");
  }
});



app.get("/user/:id", authenticateAdminOrLowuser, async (req, res) => {
  const { id } = req.params;
  console.log(id)
  const user = await User.findOne({ where: { id: id } });
  if (!user) {

    return res.send("Não tem!")
  }
  res.render("moldetwo.ejs", { user: user })
})




app.get("/login", (req, res) => {
  res.render("saude/login.ejs")
})

app.get("/download", authenticateADM, async (req, res) => {
  const candidates = await User.findAll();
  res.render("saude/downloadxls.ejs", { candidates, candidates })
})



app.post("/authenticate", async (req, res) => {
  try {

    let { username, password } = req.body;

    console.log(username, password)

    // Procurar o usuário pelo nome
    const user = await Admin.findOne({ where: { user_name: username } });

    if (user) {
      // Comparar a senha fornecida com a senha criptografada no banco
      const comparison = await bcryptjs.compare(password, user.password);


      if (comparison) {
        // Se a senha for correta, salvar os dados do usuário na sessão
        req.session.user = {
          id: user.id,
          name: user.name,
          roles: user.roles,
        };

        console.log(req.session.roles)

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

app.post("/isvalid", authenticateAdminOrLowuser, (req, res) => {
  let { candidateId, notice, description, aprovado, reprovado } = req.body;  // Pegando os dados da requisição
  const idAvalible = req.session.user.id;
  iae = candidateId
  console.log(candidateId, description, aprovado, reprovado);

  // Verificando a lógica dos parâmetros "aprovado" e "reprovado"
  if (aprovado === undefined && reprovado === undefined) {
    aprovado = null;  // Nenhuma opção foi selecionada, então "aprovado" é nulo
  } else if (aprovado === "Aprovado" && reprovado === undefined) {
    aprovado = true;  // Se aprovado é "Aprovado" e "reprovado" não foi definido
  } else if (reprovado === "Reprovado" && aprovado === undefined) {
    aprovado = false; // Se reprovado é "Reprovado" e "aprovado" não foi definido
  }

  // Atualiza o candidato no banco de dados
  User.update(
    {
      description: description,
      notice: notice,
      isValid: aprovado,             // Atualiza o campo "isValid" com o valor de aprovado
      adminId: idAvalible            // Atualiza o campo "adminId" com o id do administrador
    },
    {
      where: { id: candidateId }  // Condição para identificar o candidato
    }
  ).then(() => {
    // Corrigido para acessar corretamente o roles no req.session
    if (req.session.user.roles === "admin") {
      res.redirect("/controller");
    } else {
      res.send(`<h1 style="text-align: center; font-family: sans-serif;">Avaliação Cadastrada com Sucesso!</h1>`);
    }
  }).catch(err => {
    console.error(err);
    res.status(500).send("Erro ao atualizar candidato.");
  });
});


app.get("/controller", authenticateADM, async (req, res) => {
  const id = req.session.user.id;
  console.log(id)
  const candidates = await User.findAll();
  const contagem = await User.findAll({
    where: {
      adminId: id
    }
  });
  res.render("saude/admin.ejs", { candidates, cotagem: contagem })
})

app.get("/select/:id", authenticateAdminOrLowuser, async (req, res) => {
  const { id } = req.params;
  const user = await User.findOne({ where: { id: id } });
  res.render("saude/moldeone.ejs", { user: user });
});

app.get("/description/:id", authenticateADM, async (req, res) => {
  const { id } = req.params;
  const user = await User.findOne({ where: { id: id } });
  res.render("saude/description.ejs", { user: user });
});


app.get("/controller/lowuser", authenticateLowuser, async (req, res) => {
  const id = req.session.user.id;
  console.log("O ID DA SESSÃO " + id)
  const contagem = await User.findAll({
    where: {
      adminId: id
    }
  });

  const candidates = await User.findAll();
  res.render("saude/lowuser.ejs", { candidates, candidates, cotagem: contagem })
})

app.get("/filter", authenticateAdminOrLowuser, (req, res) => {
  const filterUser = false
  res.render("saude/filter.ejs", { filterUser: filterUser })
})

const { Op } = require('sequelize');  // Importar o operador Op

app.get("/filter/user", authenticateAdminOrLowuser, async (req, res) => {
  const { status, position } = req.query; // Usa req.query para pegar os parâmetros da URL

  let value;

  // Verifica o status
  if (status === "aprovado") {
    value = 1; // Filtra apenas aprovados
  } else if (status === "reprovado") {
    value = 0; // Filtra apenas reprovados
  } else if (status === "ambos") {
    value = [0, 1]; // Quando status for "ambos", traz tanto aprovados quanto reprovados
  } else if (status) {
    // Caso o status seja uma string que contenha "aprovado" ou "reprovado"
    value = [];
    if (status.includes("aprovado")) value.push(1);
    if (status.includes("reprovado")) value.push(0);
  } else {
    value = null; // Quando o status não for um valor válido, não filtra por status
  }

  try {
    let whereClause = { position: position }; // Filtra pela posição

    // Se o status for "ambos", usa o operador Op.in
    if (value !== null && Array.isArray(value)) {
      whereClause.isvalid = { [Op.in]: value };
    } else if (value !== null) {
      // Se o valor for 1 ou 0, usa diretamente no filtro
      whereClause.isvalid = value;
    }

    // Consulta no banco de dados com os filtros
    const filterUser = await User.findAll({
      where: whereClause
    });

    // Envia os dados para o template EJS
    res.render("filter", { filterUser: filterUser });

  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao buscar dados');
  }
});





app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.clearCookie("connect.sid", { path: "/" });
      res.redirect("/login");
    }
  });
});




app.get("/avaliable", authenticateADM, async (req, res) => {
  // Buscando os usuários e incluindo os dados do administrador usando o alias 'admin'
  const user_1 = await User.findAll({
    where: { adminId: 1 },
    include: [{
      model: Admin,
      as: 'admin',  // Especificando o alias aqui
      attributes: ['name'],
    }],
  });

  const user_2 = await User.findAll({
    where: { adminId: 2 },
    include: [{
      model: Admin,
      as: 'admin',  // Especificando o alias aqui
      attributes: ['name'],
    }],
  });

  const user_3 = await User.findAll({
    where: { adminId: 3 },
    include: [{
      model: Admin,
      as: 'admin',  // Especificando o alias aqui
      attributes: ['name'],
    }],
  });

  const user_4 = await User.findAll({
    where: { adminId: 4 },
    include: [{
      model: Admin,
      as: 'admin',  // Especificando o alias aqui
      attributes: ['name'],
    }],
  });

  const user_5 = await User.findAll({
    where: { adminId: 5 },
    include: [{
      model: Admin,
      as: 'admin',  // Especificando o alias aqui
      attributes: ['name'],
    }],
  });

  const user_6 = await User.findAll({
    where: { adminId: 6 },
    include: [{
      model: Admin,
      as: 'admin',  // Especificando o alias aqui
      attributes: ['name'],
    }],
  });

  const user_7 = await User.findAll({
    where: { adminId: 7 },
    include: [{
      model: Admin,
      as: 'admin',  // Especificando o alias aqui
      attributes: ['name'],
    }],
  });

  // Passando a quantidade de usuários e o nome do administrador para o EJS
  res.render("saude/quantidade.ejs", {
    user_1_count: user_1.length,
    user_2_count: user_2.length,
    user_3_count: user_3.length,
    user_4_count: user_4.length,
    user_5_count: user_5.length,
    user_6_count: user_6.length,
    user_7_count: user_7.length,
    user_1_name: user_1[0]?.admin?.name, // Acessando o nome do Admin
    user_2_name: user_2[0]?.admin?.name,
    user_3_name: user_3[0]?.admin?.name,
    user_4_name: user_4[0]?.admin?.name,
    user_5_name: user_5[0]?.admin?.name,
    user_6_name: user_6[0]?.admin?.name,
    user_7_name: user_7[0]?.admin?.name
  });
});





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



app.use((req, res) => {
  res.redirect("/")
})



// Inicia o servidor HTTPS usando os certificados SSL do Let's Encrypt
// https.createServer(sslOptions, app).listen(8080, () => {
//   console.log(`Servidor HTTPS rodando na porta ${8080}`);
// });

app.listen(8082, ()=>{
  console.log("servidor rodando.")
})