import { db } from '#prisma/db.js';

function createUser(data) {
  return db.orm.public.User.create(data);
}

function findUserById(id) {
  return db.orm.public.User.where({ id: Number(id) }).first();
}

function findAllUsers() {
  return db.orm.public.User.all();
}

function updateUser(id, data) {
  return db.orm.public.User.where({ id: Number(id) }).update(data);
}

function deleteUser(id) {
  return db.orm.public.User.where({ id: Number(id) }).delete();
}

function findUserByEmail(email) {
  return db.orm.public.User.where({ email }).first();
}

export const usersRepository = {
  createUser,
  findUserById,
  findAllUsers,
  updateUser,
  deleteUser,
  findUserByEmail,
};
