import Sequelize from 'sequelize';
import pkg from 'sequelize/lib/utils/deprecations';
const { noBoolOperatorAliases } = pkg;
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const db = new Sequelize(
  process.env.BD_NOMBRE,
  process.env.BD_USER,
  process.env.BD_PASS,
  {
    host: process.env.BD_HOST,
    port: 3306,
    dialect: 'mysql',
    difine: {
      timestamps: true,
    },
    pool: {
      max: 5,
      min: 0,
      acquiere: 30000,
      idle: 10000,
    },
    noBoolOperatorAliases: false,
  }
);

export default db;
