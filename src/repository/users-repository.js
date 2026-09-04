import { prisma } from '#db/prisma.js';

function createUser(data) {
  return prisma.user.create({
    data,
  });
}

function findUserById(id) {
  return prisma.user.findUnique({
    where: { id: Number(id) },
  });
}

function findAllUsers() {
  return prisma.user.findMany();
}

function updateUser(id, data) {
  return prisma.user.update({
    where: { id: Number(id) },
    data,
  });
}

function deleteUser(id) {
  return prisma.user.delete({
    where: { id: Number(id) },
  });
}

function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export const usersRepository = {
  createUser,
  findUserById,
  findAllUsers,
  updateUser,
  deleteUser,
  findUserByEmail,
};
