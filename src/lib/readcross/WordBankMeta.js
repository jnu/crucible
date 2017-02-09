export const WL_TYPE_PREMADE = 'premade';

export const WL_TYPE_CUSTOM = 'custom';

export class WordBankMeta {
    constructor(name, type, bank) {
        if (DEBUG) {
            const validTypes = [WL_TYPE_PREMADE, WL_TYPE_CUSTOM];
            if (validTypes.indexOf(type) < 0) {
                throw new Error(`Type must be one of ${validTypes.join(', ')}`);
            }
        }
        this.name = name;
        this.type = type;
        this.bank = bank;
    }
}
