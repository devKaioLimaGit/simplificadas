const Sequelize = require("sequelize");
const Connection = require("../../database/bankconnection");
const Admin = require("../admin/Adimin")
const Users = Connection.define("users", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  protocol: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },

  filename: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  name: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  cpf: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  birth: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  ageinyears: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  gender: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  rg: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  organ: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  uf: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  title: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  pis: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  civilstatus: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  education: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  mother: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  nationality: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  cityofbirth: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  birthplacestate: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  raceandcolor: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  bloodtype: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING(191),
    allowNull: false,
    unique: true,
  },
  tel: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  zip: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  address: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  housenumber: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  housecomplement: {
    type: Sequelize.STRING(191),
    allowNull: true, // Altere para 'true' se o campo for opcional
  },
  neighborhood: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  city: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  position: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  experience: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  experienceExit: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  advice: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  registrationCouncil: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  deficiency: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  deficiencyContext: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  jury: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },

  term: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  description:{
    type: Sequelize.TEXT,
    allowNull: true,
  },
  isValid:{
    type: Sequelize.BOOLEAN,
    default: false,
  },
  notice:{
    type: Sequelize.TEXT,
    allowNull: true,
  },
  adminId: {
    type: Sequelize.INTEGER,
    references: {
      model: Admin,
      key: 'id',
    },
    allowNull: true,  // Isso pode ser alterado se a associação for opcional
  }
  
}, {
  tableName: "User",  // Mantendo o nome da tabela igual ao banco
  timestamps: true,   // Desativa os campos createdAt e updatedAt, caso não sejam necessários
});

Admin.hasMany(Users, {
  foreignKey: 'adminId',  // Relaciona a chave estrangeira
  as: 'users',  // Nome para acessar os usuários de um administrador
});

Users.belongsTo(Admin, {
  foreignKey: 'adminId',  // Relaciona a chave estrangeira
  as: 'admin',  // Nome para acessar o administrador de um usuário
});


Connection.sync({ force: true });

Users.beforeSave((user, options) => {
  // Lista de campos a serem convertidos para maiúsculas
  const fieldsToUpper = [
    'name', 'cpf', 'birth', 'ageinyears', 'gender', 'rg', 'organ', 'uf', 'title', 
    'pis', 'civilstatus', 'education', 'mother', 'nationality', 'cityofbirth', 
    'birthplacestate', 'raceandcolor', 'bloodtype', 'tel', 'zip', 
    'address', 'housenumber', 'complement', 'neighborhood', 'city', 'position', 
    'experience', 'experienceExit', 'registrationCouncil', 'deficiency', 
    'deficiencyContext', 'jury', 'protocol', 'term'
  ];

  // Converte para maiúsculas todos os campos, exceto o email
  fieldsToUpper.forEach(field => {
    if (user[field]) {
      user[field] = user[field].toUpperCase();
    }
  });

  // Retorna o usuário para ser salvo com os campos modificados
  return user;
});

module.exports = Users;
