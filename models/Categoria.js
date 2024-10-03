import { DataTypes } from 'sequelize';
import db from '../config/db.js';
import { toDefaultValue } from 'sequelize/lib/utils';

const Categoria = db.define('categorias', {
  nombre: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
});

export default Categoria;
