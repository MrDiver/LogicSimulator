export enum PortType {
    IN,
    OUT,
    DEBUG
}

enum LogicValue {
    HIGH = "1",
    LOW = "0",
    X = "X",
    Z = "Z",
}

let _id_counter = 0;
function id() {
    return _id_counter++;
}

interface IdHolder {
    id: number;
}

interface INamed {
    name: string;
}

interface ConnectionPoint extends IdHolder, INamed {
    add(w: Wire): void;
    remove(w: Wire): void;
    sendToConnection(value: LogicValue, sender: Wire | OutPort | null): void;
}

export class MultiConnect implements ConnectionPoint {
    id: number;
    name: string;
    connections: Wire[];
    constructor() {
        this.id = id();
        this.name = "MultiConnect" + this.id
        this.connections = [];
    }
    add(w: Wire) {
        this.connections.push(w);
    }
    remove(w: Wire) {
        const index = this.connections.indexOf(w);
        if (index > -1) { // only splice array when item is found
            this.connections.splice(index, 1); // 2nd parameter means remove one item only
        }
    }
    sendToConnection(value: LogicValue, sender: Wire | OutPort | null = null) {
        console.debug(`[MultiConnect${this.id}] Received write from ${sender?.name} with ${value}`);
        for (const wire of this.connections) {
            if (wire !== sender) {
                console.debug(`[MultiConnect${this.id}] Write ${wire.name} => ${value}`)
                wire.updateWire(value, this);
            } else {
                console.debug(`[MultiConnect${this.id}] Skipping ${wire.name}`)
            }
        }
    }
    toString() {
        return `[${this.name} (${this.connections.map(e => e.id).join(", ")})]`;
    }
}

export class Wire implements IdHolder, INamed {
    id: number;
    name: string;
    #value: LogicValue;
    a: ConnectionPoint;
    b: ConnectionPoint;
    constructor(a: ConnectionPoint, b: ConnectionPoint) {
        this.id = id();
        this.name = "Wire" + this.id;
        this.a = a;
        this.b = b;
        this.#value = LogicValue.Z;
        a.remove(this);
        a.add(this);
        b.remove(this);
        b.add(this);
    }
    disconnected() {
        this.a.remove(this);
        this.b.remove(this);
    }
    updateWire(value: LogicValue, sender: ConnectionPoint): boolean {
        console.debug(`[${this.name}] Received write from ${sender.name} (${this.#value} => ${value})`);
        if (value === this.#value) {
            console.debug(`[${this.name}] Cancelling write same value`);
            return false;
        };
        if (sender.id === this.a.id) {
            console.debug(`[${this.name}] Writing to B: ${this.b.name}`)
            this.b.sendToConnection(value, this);
        } else {
            console.debug(`[${this.name}] Writing to A: ${this.a.name}`)
            this.a.sendToConnection(value, this);
        }
        this.#value = value;
        return true;
    }
    viewWire(): LogicValue {
        return this.#value;
    }
    toString() {
        return `[${this.name} (${this.#value})]`
    }
}

interface IPort extends ConnectionPoint, INamed {
    port_id: number;
}

export class InPort implements IPort {
    id: number;
    port_id: number;
    name: string;
    #value: LogicValue;
    #connection: Wire | null;
    #onInputChange;
    constructor(port_id: number, onInputChange: (p: InPort | null) => void) {
        this.id = id();
        this.port_id = port_id;
        this.name = `InPort(${this.port_id})_${this.id}`;
        this.#onInputChange = onInputChange;
        this.#value = LogicValue.Z;
        this.#connection = null;
    }
    add(w: Wire): void {
        console.debug(`${this.name} Connected to ${w.name}`);
        this.#connection = w;
    }
    remove(w: Wire): void {
        console.debug(`${this.name} Disconnected from ${w.name}`);
        this.#connection = null;
    }

    sendToConnection(value: LogicValue, sender: Wire | null): void {
        console.debug(`[${this.name}] Received Write from ${sender?.name} (${this.#value} => ${value})`);
        if (value !== this.#value) {
            this.#value = value;
            this.#onInputChange(this);
        } else {
            console.debug(`[${this.name}] Skipping Write from ${sender?.name}`);
        }
    }

    readPort(): LogicValue {
        return this.#value;
    }
}

export class OutPort extends MultiConnect implements IPort {
    port_id: number;
    constructor(port_id: number) {
        super();
        this.port_id = port_id;
        this.name = `OutPort(${this.port_id})_${this.id}`;
    }

    writePort(value: LogicValue) {
        console.debug(`[${this.name}] Sending output -> ${value}`)
        this.sendToConnection(value, this);
    }
}

interface Positionable {
    pos_x: number;
    pos_y: number;
}

export abstract class AbstractNode implements IdHolder {
    id: number;
    name: string;
    in_ports: InPort[];
    out_ports: OutPort[];

    constructor(name: string, n_in: number, n_out: number) {
        this.id = id();
        this.name = name + this.id;
        this.in_ports = [];
        this.out_ports = [];
        for (let i = 0; i < n_in; i++) {
            this.in_ports.push(new InPort(i, this.onInputChange.bind(this)));
        }
        for (let i = 0; i < n_out; i++) {
            this.out_ports.push(new OutPort(i));
        }
    }

    abstract customUpdate(p: InPort | null): void

    onInputChange(p: InPort | null): void {
        console.debug(`[${this.name}] Received update on ${p?.name}`);
        this.customUpdate(p);
    }
}



export class Inverter extends AbstractNode {
    constructor() {
        super("Inverter", 1, 1);
    }

    customUpdate(): void {
        let a = this.in_ports[0].readPort();
        let out = this.out_ports[0];
        switch (a) {
            case LogicValue.Z: {
                out.writePort(LogicValue.X);
                break;
            }
            case LogicValue.X: {
                out.writePort(LogicValue.X);
                break;
            }
            case LogicValue.LOW: {
                out.writePort(LogicValue.HIGH);
                break;
            }
            case LogicValue.HIGH: {
                out.writePort(LogicValue.LOW);
                break;
            }
        }
    }
}

export class MainTest {
    crazy_func(): void {
        // console.log("TESTING");
        // let a = new MultiConnect();
        // let b = new MultiConnect();
        // let wire = new Wire(a, b);
        // a.add(wire);
        // b.add(wire);
        // console.log(a.toString())
        // console.log(b.toString())
        // console.log(wire.toString())
        // console.log("SETTING TO HIGH")
        // a.sendToConnection(LogicValue.HIGH);
        // console.log("AFTER SETTING")
        // console.log(a.toString())
        // console.log(b.toString())
        // console.log(wire.toString())

        const n1 = new Inverter();
        const button = new OutPort(0);
        const wire1 = new Wire(button,n1.in_ports[0]);
        const led = new InPort(0,e=>{console.log(`LED -> ${e?.readPort()}`)})
        const wire2 = new Wire(n1.out_ports[0], led);
        console.log(n1);
        console.log("Writing Inverter");
        button.sendToConnection(LogicValue.LOW);
        button.sendToConnection(LogicValue.HIGH);
        button.sendToConnection(LogicValue.X);
        button.sendToConnection(LogicValue.Z);
    }
}

