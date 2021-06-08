import { Instructions } from '../../typings/index.d.ts';

export const instructions: Instructions = {
    // Moving values
    MOV_LIT_REG: 0x10,
    MOV_REG_REG: 0x11,
    MOV_REG_MEM: 0x12,
    MOV_MEM_REG: 0x13,

    // Adding values
    ADD_REG_REG: 0x14,

    // Conditional jumps
    JMP_NOT_EQ: 0x15,

    // Pushing values
    PSH_LIT: 0x17,
    PSH_REG: 0x18,

    // Poping values
    POP: 0x1A,

    // Calling values
    CAL_LIT: 0x5E,
    CAL_REG: 0x5F,

    // Return
    RET: 0x60,

    // Halt
    HLT: 0xFF
};