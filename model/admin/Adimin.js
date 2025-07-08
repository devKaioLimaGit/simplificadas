const Sequelize = require("sequelize");
const bcrypt = require("bcrypt");
const Connection = require("../../database/bankconnection");

const Admin = Connection.define("admin", {
  name: {
    type: Sequelize.STRING(191),
    allowNull: false,
    unique: true
  },
  user_name: {  // Novo campo "user_name"
    type: Sequelize.STRING(191),
    allowNull: false,
    unique: true  // Garantir que o nome de usuário seja único
  },
  password: {
    type: Sequelize.STRING(191),
    allowNull: false
  },
  roles: {
    type: Sequelize.STRING(191),
    allowNull: false
  },
  
}, {
  tableName: "Admin",  // Nome da tabela conforme solicitado
  timestamps: true,    // Ativar os campos createdAt e updatedAt, caso necessário
});

// Função para criptografar e criar o admin
async function createAdmin(name, userName, password, roles) {
  const hashedPassword = await bcrypt.hash(password, 10);  // Criptografar a senha
  await Admin.create({
    name: name,
    user_name: userName,  // Novo campo
    password: hashedPassword,
    roles: roles
  });
}

Connection.sync({ force: true }).then(async () => {
  try {
    // Criar admins de 1 a 7, com senhas criptografadas individualmente
    await createAdmin("DENISE MARIA CAVALCANTI MACÊDO", "denise.macedo", "D3n!s3M@c@d0#2025", "admin");
    await createAdmin("JOANNE ALVES RODRIGUES DE LIMA", "joanne.lima", "J0@nn3L1m@2025!", "lowuser");
    await createAdmin("HINGRID WANDILLE BARROS DA SILVA SA", "hingrid.sa", "H1ngr!dS@2025#Sa", "lowuser");
    await createAdmin("ELIZABETH LOPES DA SILVA", "elizabeth.silva", "E!l!z@b3thS!lv@2025", "lowuser");
    await createAdmin("ROSANGELA GOMES PINHEIRO", "rosangela.pinheiro", "R0s@ng3l@P!nh3ir0#2025", "lowuser");
    await createAdmin("ROGERIO PINHEIRO DE CARVALHO", "rogerio.carvalho", "R0g3r!0C@rv@lh0#2025", "lowuser");
    await createAdmin("MARIA CECÍLIA DA CONSTA MARTINS", "maria.martins", "M@r!@C3c!l!@2025M@rt!ns", "lowuser");

    console.log("Admin(s) registrados com sucesso!");
  } catch (err) {
    console.error("Erro ao registrar admin(s):", err);
  }
});


module.exports = Admin;
