const blacklist = new Set<string>();

export const blacklistToken = (tokenId: string): void => {
  blacklist.add(tokenId);
};

export const isBlacklisted = (tokenId: string): boolean => {
  return blacklist.has(tokenId);
};
