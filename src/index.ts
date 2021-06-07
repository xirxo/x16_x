import { CPU, createMemory, instructions } from './mod.ts';

const memory = createMemory(256);
const writeByte = new Uint8Array(memory.buffer);

const cpu = new CPU(memory);

writeByte[0] = instructions.MOV_LIT_R1;
writeByte[1] = 0x12; // 0x1234
writeByte[2] = 0x34;

writeByte[3] = instructions.MOV_LIT_R2;
writeByte[4] = 0xAB; // 0xABCD
writeByte[5] = 0xCD;

writeByte[6] = instructions.ADD_REG_REG;
writeByte[7] = 2; // r1 index
writeByte[8] = 3; // r2 index

cpu.debug();

cpu.step();
cpu.debug();

cpu.step();
cpu.debug();

cpu.step();
cpu.debug();