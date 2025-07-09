const Sequelize = require("sequelize");

const connection = new Sequelize("simplifiedsema", "root", "12345678", {
  host: "localhost",
  dialect: "mysql",
  port: 3306
});

connection.authenticate()
  .then(() => console.log("Conexão bem-sucedida ao banco de dados!"))
  .catch((erro) => console.error("Erro ao conectar ao banco de dados:", erro));

module.exports = connection; 