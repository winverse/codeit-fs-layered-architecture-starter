import { db } from '#prisma/db.js';

export const userRepository = {
  create(data) {
    return db.orm.public.User.create(data);
  },

  // id를 숫자로 바꿔 넘깁니다. id가 undefined면 NaN 오류가 나서 조건 없이 첫 행을 조회·수정·삭제하는 일을 막습니다.
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
