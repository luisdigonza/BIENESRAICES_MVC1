import { check, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import Usuario from '../models/Usuario.js';
import db from '../config/db.js';
import { where } from 'sequelize';
import { generarJWT, generarId } from '../helpers/tokens.js';
import { emailRegistro, emailOlvidePassword } from '../helpers/emails.js';

const formularioLogin = (req, res) => {
  res.render('auth/login', {
    pagina: 'Iniciar Sesión',
    csrfToken: req.csrfToken(),
  });
};

const auntenticar = async (req, res) => {
  await check('email')
    .isEmail()
    .withMessage('El email es obligatorio')
    .run(req);

  await check('password')
    .notEmpty()
    .withMessage('El password es obligatorio')
    .run(req);

  let resultado = validationResult(req);

  //return res.json(resultado.array());
  // Verificar que el resultado este vacio
  if (!resultado.isEmpty()) {
    //Errores
    return res.render('auth/login', {
      pagina: 'Iniciar Sesion',
      errores: resultado.array(),
      csrfToken: req.csrfToken(),
    });
  }
  const { email, password } = req.body;

  // confirmar si el usuario existe
  const usuario = await Usuario.findOne({ where: { email } });
  if (!usuario) {
    return res.render('auth/login', {
      pagina: 'Iniciar Sesion',
      csrfToken: req.csrfToken(),
      errores: [{ msg: 'El usuario no existe' }],
    });
  }

  // Comprobar si el usuario esta confirmado
  if (!usuario.confirmado) {
    return res.render('auth/login', {
      pagina: 'Iniciar Sesion',
      csrfToken: req.csrfToken(),
      errores: [{ msg: 'Tu cuenta no ha sido confirmada' }],
    });
  }

  // Revisar la password
  if (!usuario.verificarPassword(password)) {
    return res.render('auth/login', {
      pagina: 'Iniciar Sesion',
      csrfToken: req.csrfToken(),
      errores: [{ msg: 'El password es incorrecto' }],
    });
  }

  // Autenticar el usuario

  const token = generarJWT({ id: usuario.id, nombre: usuario.nombre });
  console.log(token);

  // Almacenar en un cookie

  return res
    .cookie('_token', token, {
      httpOlny: true,
      // secure: true,
    })
    .redirect('/mis-propiedades');
};

const formularioRegistro = (req, res) => {
  res.render('auth/registro', {
    pagina: 'Crear cuenta',
    csrfToken: req.csrfToken(),
  });
};

const registrar = async (req, res) => {
  //Validacion
  // console.log(req.body);
  await check('nombre')
    .notEmpty()
    .withMessage('El nombre no puede ir vacio')
    .run(req);

  await check('email').isEmail().withMessage('Eso no parece un email').run(req);

  await check('password')
    .isLength({ min: 6 })
    .withMessage('El passoword debe ser almonos 6 caracteres')
    .run(req);

  // await check('repetirPassword')
  //   .custom((value, { req }) => value === req.body.password)
  //   .withMessage('Las passwords no son iguales')
  //   .run(req);

  await check('repetirPassword')
    .equals(req.body.password)
    .withMessage('Las passwords no son iguales')
    .run(req);

  let resultado = validationResult(req);

  //return res.json(resultado.array());
  // Verificar que el resultado este vacio
  if (!resultado.isEmpty()) {
    //Errores
    return res.render('auth/registro', {
      pagina: 'Crear Cuenta',
      errores: resultado.array(),
      csrfToken: req.csrfToken(),
      usuario: {
        nombre: req.body.nombre,
        email: req.body.email,
      },
    });
  }

  //Extraer datos
  const { nombre, email, password } = req.body;

  //Verificar que el usuario no este registrado
  const existeUsuario = await Usuario.findOne({
    where: { email },
  });

  if (existeUsuario) {
    return res.render('auth/registro', {
      pagina: 'Crear Cuenta',
      csrfToken: req.csrfToken(),
      errores: [{ msg: 'El usuario ya esta Registrado' }],
      usuario: {
        nombre: req.body.nombre,
        email: req.body.email,
      },
    });
  }

  //Almacenar un usuario
  const usuario = await Usuario.create({
    nombre,
    email,
    password,
    token: generarId(),
  });

  // Envia email de confirmacion

  emailRegistro({
    nombre: usuario.nombre,
    email: usuario.email,
    token: usuario.token,
  });

  // Mostrar mensaje de confirmacion
  res.render('templates/mensaje', {
    pagina: 'Cuenta creada correctamente',
    mensaje: 'Hemos enviado un email de confirmación, presiona en el enlace',
  });
};

// Funcion que compruebe una cuenta
const confirmar = async (req, res) => {
  const { token } = req.params;

  // Verificar si el token es valido
  const usuario = await Usuario.findOne({ where: { token } });

  if (!usuario) {
    return res.render('auth/confirmar-cuenta', {
      pagina: 'Error al confirmar tu cuenta',
      mensaje: 'Hubo un error al confirmar tu cuenta, intenta de nuevo',
      error: true,
    });
  }
  // Confirmar la cuenta
  usuario.token = null;
  usuario.confirmado = true;
  await usuario.save();

  return res.render('auth/confirmar-cuenta', {
    pagina: 'Cuenta confirmada',
    mensaje: 'La cuenta se confirmo correctamente',
  });
};

const formularioOlvidePassword = (req, res) => {
  res.render('auth/olvide-password', {
    pagina: 'Recupera tu acceso a Bienes Raices',
    csrfToken: req.csrfToken(),
  });
};

//

const resetPassword = async (req, res) => {
  //Validacion
  await check('email').isEmail().withMessage('Eso no parece un email').run(req);

  let resultado = validationResult(req);

  // Verificar que el resultado este vacio
  if (!resultado.isEmpty()) {
    //Errores
    return res.render('auth/olvide-password', {
      pagina: 'Recupera tu acceso a Bienes Raices',
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
    });
  }

  // Buscar el usuario

  const { email } = req.body;

  const usuario = await Usuario.findOne({ where: { email } });
  if (!usuario) {
    return res.render('auth/olvide-password', {
      pagina: 'Recupera tu acceso a Bienes Raices',
      csrfToken: req.csrfToken(),
      errores: [{ msg: 'El Email no pertenece a ningun usuario' }],
    });
  }
  // Generar un token y eviar el email
  usuario.token = generarId();
  await usuario.save();

  // Eviar el email
  emailOlvidePassword({
    email: usuario.email,
    nombre: usuario.nombre,
    token: usuario.token,
  });

  // Renderizar el mensaje
  res.render('templates/mensaje', {
    pagina: 'Reestablece tu password',
    mensaje: 'Hemos enviado un email con las instrucciones',
  });
};

const comprobarToken = async (req, res) => {
  const { token } = req.params;

  const usuario = await Usuario.findOne({ where: { token } });
  if (!usuario) {
    return res.render('auth/confirmar-cuenta', {
      pagina: 'Reestablece tu password',
      mensaje: 'Hubo un error al validar tu inforamcion, intenta de nuevo',
      error: true,
    });
  }

  // Mostrar formulario para modificar password
  res.render('auth/reset-password', {
    pagina: 'Reestablece tu password',
    csrfToken: req.csrfToken(),
  });
};

const nuevoPassword = async (req, res) => {
  // Validar el password
  await check('password')
    .isLength({ min: 6 })
    .withMessage('El Password debe ser al menos 6 caracteres')
    .run(req);
  let resultado = validationResult(req);

  if (!resultado.isEmpty()) {
    return res.render('auth/reset-password', {
      pagina: 'Reestablece tu password',
      csrfToken: req.csrfToken(),
      errores: resultado.array(),
    });
  }

  const { token } = req.params;
  const { password } = req.body;

  // Identificar quien hace el
  const usuario = await Usuario.findOne({ where: { token } });

  // Hashear el nuevo password
  const salt = await bcrypt.genSalt(10);
  usuario.password = await bcrypt.hash(password, salt);
  usuario.token = null;

  await usuario.save();

  res.render('auth/confirmar-cuenta', {
    pagina: 'Password Reestablecida',
    mensaje: 'El password se guardo correctamente',
  });
};

export {
  formularioLogin,
  formularioRegistro,
  auntenticar,
  registrar,
  confirmar,
  formularioOlvidePassword,
  resetPassword,
  comprobarToken,
  nuevoPassword,
};
