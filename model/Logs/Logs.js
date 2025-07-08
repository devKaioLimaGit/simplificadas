const Sequelize = require("sequelize");
const Connection = require("../../database/bankconnection");
const Admin = require("../admin/Adimin");
const Users = require("../user/User");

const Logs = Connection.define("logs", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  action: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  timestamp: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
  adminId: {
    type: Sequelize.INTEGER,
    references: {
      model: Admin,
      key: 'id',
    },
    allowNull: true, // Relacionado ao admin, mas não obrigatório
  },
  userId: {
    type: Sequelize.INTEGER,
    references: {
      model: Users,
      key: 'id',
    },
    allowNull: true, // Relacionado ao usuário, mas não obrigatório
  }
}, {
  tableName: "Logs",  // Nome da tabela de logs
  timestamps: false,  // Não precisamos de createdAt/updatedAt para logs
});

// Relacionamento entre Logs e Admin
Logs.belongsTo(Admin, {
  foreignKey: 'adminId', 
  as: 'admin', // Para acessar o admin de um log
});

// Relacionamento entre Logs e Users
Logs.belongsTo(Users, {
  foreignKey: 'userId', 
  as: 'user', // Para acessar o usuário de um log
});

// Sincroniza a tabela de logs
Logs.sync({ force: true })
  .then(() => {
    console.log("Tabela de Logs criada com sucesso!");
  })
  .catch((err) => {
    console.error("Erro ao criar tabela de Logs:", err);
  });


module.exports = Logs;
