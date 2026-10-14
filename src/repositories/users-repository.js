import { db } from '#prisma/db.js';

export const userRepository = {
  create(data) {
    return db.orm.public.User.create(data);
  },

  findById(id) {
    return db.orm.public.User.where({ id: Number(id) }).first();
  },

  findAll() {
    return db.orm.public.User.all();
  },

  update(id, data) {
    return db.orm.public.User.where({ id: Number(id) }).update(data);
  },

  delete(id) {
    return db.orm.public.User.where({ id: Number(id) }).delete();
  },

  findByEmail(email) {
    return db.orm.public.User.where({ email }).first();
  },
};
