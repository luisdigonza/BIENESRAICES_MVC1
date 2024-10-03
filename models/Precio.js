import { DataTypes } from 'sequelize';
import db from '../config/db.js';
import { toDefaultValue } from 'sequelize/lib/utils';

const Precio = db.define('precios', {
  nombre: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
});

export default Precio;
