import { AuthUser } from "../modules/auth/auth.model";

const findLastUserId = async (): Promise<string | null> => {
  const lastUser = await AuthUser.findOne().sort({ createdAt: -1 });
  return lastUser ? lastUser.id : null;
};

export const generateUserId = async (): Promise<string> => {
  const lastUserId = await findLastUserId();

  if (lastUserId) {
    const numericPart = parseInt(lastUserId.slice(-4), 10);
    const newNumericPart = numericPart + 1;
    return `SP${newNumericPart.toString().padStart(4, "0")}`;
  } else {
    return "SP0001";
  }
};
