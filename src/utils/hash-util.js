import bcrypt from 'bcrypt';

export const hashPassword = async (password) => {
  const saltRounds = 10; // bcrypt 해싱 비용 인자 (2^10 = 1024번 반복, 높을수록 안전하지만 느림)
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};
