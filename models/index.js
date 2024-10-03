import Propiedad from './Propiedad.js';
import Precio from './Precio.js';
import Categoria from './Categoria.js';
import Usuario from './Usuario.js';

Propiedad.belongsTo(Precio, { foreingKey: 'precioId' });
Propiedad.belongsTo(Categoria, { foreingKey: 'categoriaId' });
Propiedad.belongsTo(Usuario, { foreingKey: 'usuarioId' });

export { Propiedad, Precio, Categoria, Usuario };
