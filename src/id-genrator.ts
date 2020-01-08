class IdGenerator {
    seq: number;

    constructor() {
        this.seq = 0;
    }
    next(): string {
        this.seq++;
        return `__fbd_id_${+new Date()}_${this.seq}`;
    }
}

const instance = new IdGenerator();

export default instance;