const Sequelize = require("sequelize");
const Connection = require("../../../database/bankconnection-sema");

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
  military: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  nationality: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  proficiency: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING(191),
    allowNull: false,
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
    allowNull: true,
  },
  neighborhood: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  city: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  ufresidence: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  position: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  education: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  course: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  council: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  councilnumber: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  experience: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  deficiency: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  deficiencyContext: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  accumulation: {
    type: Sequelize.STRING(191),
    allowNull: false,
  },
  accumulationInfo: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  term: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  isValid: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  notice: {
    type: Sequelize.TEXT,
    allowNull: true,
  }
}, {
  tableName: "User",
  timestamps: true,
});

// Hook para converter campos para maiúsculas antes de salvar
Users.beforeSave((user, options) => {
  const fieldsToUpper = [
    'protocol', 'filename', 'name', 'cpf', 'birth', 'rg', 'organ', 'uf', 'title',
    'military', 'nationality', 'proficiency', 'tel', 'zip', 'address', 'housenumber',
    'housecomplement', 'neighborhood', 'city', 'ufresidence', 'position', 'education',
    'course', 'council', 'councilnumber', 'deficiency', 'accumulation'
  ];

  fieldsToUpper.forEach(field => {
    if (user[field]) {
      user[field] = user[field].toUpperCase();
    }
  });

  // Converte campos de texto longo, se existirem
  if (user.deficiencyContext) {
    user.deficiencyContext = user.deficiencyContext.toUpperCase();
  }
  if (user.accumulationInfo) {
    user.accumulationInfo = user.accumulationInfo.toUpperCase();
  }

  // Email em minúsculas
  if (user.email) {
    user.email = user.email.toLowerCase();
  }

  return user;
});

module.exports = Users;