export interface Instructions {
    MOV_LIT_REG: number;
    MOV_REG_REG: number;
    MOV_REG_MEM: number;
    MOV_MEM_REG: number;
    ADD_REG_REG: number;
    JMP_NOT_EQ: number;
    PSH_LIT: number;
    PSH_REG: number;
    POP: number;
    CAL_LIT: number;
    CAL_REG: number;
    RET: number;
    HLT: number;
}