import bcrypt from 'bcrypt';
const usuarios = [
  {
    nombre: 'Diego',
    email: 'diego@diego.com',
    confirmado: 1,
    password: bcrypt.hashSync('password', 10),
  },
];

export default usuarios;
