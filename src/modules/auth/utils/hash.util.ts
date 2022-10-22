import argon2 from 'argon2';

export const hash = (plainText: string) => argon2.hash(plainText, {});

export const verify = (plainText: string, hash: string) =>
  argon2.verify(hash, plainText);
