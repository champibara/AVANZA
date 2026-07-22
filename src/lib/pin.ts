import { customAlphabet } from "nanoid";

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const PIN_LENGTH = 8;

export const generatePin = customAlphabet(ALPHABET, PIN_LENGTH);
