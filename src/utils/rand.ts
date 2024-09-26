export const generateId = () => `a${crypto.randomUUID().replaceAll("-", "")}a`;
