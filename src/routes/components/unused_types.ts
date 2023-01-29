// Add store to and view classes to seperate backend and frontend an automagically udpate values
export enum PortType {
    IN,
    OUT,
    MULTI,
}

export enum LogicValue {
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

interface ICheckDrivable {
    checkOnlyOneDriver(sender: Wire | OutPort | ConnectionPoint): number;
}

export interface ConnectionPoint extends IdHolder, INamed, ICheckDrivable, Positionable{
    port_type : PortType;
    add(w: Wire): void;
    remove(w: Wire): void;
    sendToConnection(value: LogicValue, sender: Wire | OutPort | null): void;
    connections: Wire[];
}

export class MultiConnect implements ConnectionPoint {
    id: number;
    name: string;
    pos_x: number;
    pos_y: number;
    connections: Wire[];
    currentlyChecked = false;
    port_type: PortType;
    constructor() {
        this.id = id();
        this.name = "MultiConnect" + this.id
        this.connections = [];
        this.pos_x = 0;
        this.pos_y = 0;
        this.port_type = PortType.MULTI;
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
        console.debug(`%c[${this.name}] Received write from ${sender?.name} with ${value}`, "color:#ffbb11");
        // Check validity of signal source
        const res = this.checkOnlyOneDriver(sender);
        if (res > 0) {
            this.currentlyChecked = true;
            console.info(`%c[${this.name}] Too many drivers ${res}, invalidating`, "color:#ff1111");
            this.connections.forEach(w => w.updateWire(LogicValue.X, this))
            this.currentlyChecked = false;
            return;
        }

        // Propagating input Signal if valid else propagate X
        for (const wire of this.connections) {
            if (wire !== sender) {
                console.debug(`%c[${this.name}] Write ${wire.name} => ${value}`, "color:#ffbb11");
                wire.updateWire(value, this);
            } else {
                console.debug(`%c[${this.name}] Skipping Write ${wire.name}`, "color:#999");
            }
        }
    }
    checkOnlyOneDriver(sender: Wire | OutPort | ConnectionPoint | null): number {
        console.debug(`%c[${this.name}] Checking Validity from ${sender}`, "color:#44ff44");
        if (this.currentlyChecked) {
            return 0;
        }
        let sum = 0;
        this.currentlyChecked = true;
        for (const wire of this.connections) {
            if (wire !== sender) {
                console.debug(`%c[${this.name}] Checking Valid ${wire.name}`, "color:#4f4");
                sum += wire.checkOnlyOneDriver(this);
            } else {
                console.debug(`%c[${this.name}] Skipping Validity ${wire.name}`, "color:#999");
            }
        }
        console.info(`%c[${this.name}] Done Check: Drivers -> %c${sum}`, "color:#4f4", "color:#f44;font-weight:bold");
        this.currentlyChecked = false;
        return sum;
    }
    toString() {
        return `[${this.name} (${this.connections.map(e => e.id).join(", ")})]`;
    }
}

export class Wire implements IdHolder, INamed, ICheckDrivable {
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
    checkOnlyOneDriver(sender: Wire | OutPort | ConnectionPoint): number {
        console.debug(`%c[${this.name}] Passing check on from ${sender.name}`, "color:#4f4");
        if (sender.id === this.a.id) {
            return this.b.checkOnlyOneDriver(this);
        } else if (sender.id === this.b.id) {
            return this.a.checkOnlyOneDriver(this);
        } else {
            throw new Error("WTF HOW ARE THEY NOT CONNECTED");
        }
    }
    disconnected() {
        this.a.remove(this);
        this.b.remove(this);
    }
    updateWire(value: LogicValue, sender: ConnectionPoint): boolean {
        console.debug(`%c[${this.name}] Received write from ${sender.name} (${this.#value} => ${value})`, "color:#ffbb11");
        if (value === this.#value) {
            console.debug(`%c[${this.name}] Cancelling write same value`, "color:#ff4411");
            return false;
        };
        this.#value = value;
        if (sender.id === this.a.id) {
            console.debug(`%c[${this.name}] Writing to B: ${this.b.name}`, "color:#ffbb11")
            this.b.sendToConnection(value, this);
        } else {
            console.debug(`%c[${this.name}] Writing to A: ${this.a.name}`, "color:#ffbb11")
            this.a.sendToConnection(value, this);
        }
        return true;
    }
    viewWire(): LogicValue {
        return this.#value;
    }
    toString() {
        return `[${this.name} (${this.#value})]`
    }
}


export interface PortUpdateFunc {
    (port: InPort): void
}

export interface IPort extends ConnectionPoint, INamed{
    port_id: number;
    port_name: string;
}

export class InPort implements IPort {
    id: number;
    port_id: number;
    name: string;
    port_name: string;
    pos_x: number;
    pos_y: number;
    port_type: PortType;
    #value: LogicValue;
    connections: Wire[];
    #onInputChange;
    constructor(port_id: number, onInputChange: PortUpdateFunc | null = null) {
        this.id = id();
        this.port_id = port_id;
        this.name = `InPort(${this.port_id})_${this.id}`;
        this.port_name = "";
        this.#onInputChange = onInputChange ?? (() => { return });
        this.#value = LogicValue.Z;
        this.connections = [];
        this.pos_x = 0;
        this.pos_y = 0;
        this.port_type = PortType.IN;
    }
    checkOnlyOneDriver(sender: Wire | OutPort | ConnectionPoint): number {
        return 0;
    }
    add(w: Wire): void {
        console.debug(`${this.name} Connected to ${w.name}`);
        this.connections = [w];
    }
    remove(w: Wire): void {
        console.debug(`${this.name} Disconnected from ${w.name}`);
        this.connections = [];
    }

    sendToConnection(value: LogicValue, sender: Wire | null): void {
        console.info(`%c[${this.name}]%c Received Write from ${sender?.name} (${this.#value} => ${value})`, "color:#ffbb11", "color:white");
        this.#value = value;
        this.#onInputChange(this);
    }

    readPort(): LogicValue {
        return this.#value;
    }
}

export class OutPort extends MultiConnect implements IPort {
    port_id: number;
    port_name: string;
    port_type: PortType;
    #value: LogicValue;
    constructor(port_id: number) {
        super();
        this.port_id = port_id;
        this.name = `OutPort(${this.port_id})_${this.id}`;
        this.port_name = "";
        this.#value = LogicValue.Z;
        this.port_type = PortType.OUT;
    }
    checkOnlyOneDriver(sender: OutPort | ConnectionPoint | Wire | null): number {
        console.debug(`%c[${this.name}] EndPoint driven: ${this.isDriven()}`, "color:#4f4")
        if (this.currentlyChecked) {
            return 0;
        }
        return this.isDriven() ? 1 : 0;
    }
    writePort(value: LogicValue) {
        if (value !== this.#value) {
            this.#value = value;
            console.info(`%c[${this.name}]%c Sending output -> ${value}`, "color:yellow", "color:white")
            this.currentlyChecked = true;
            this.sendToConnection(value, this);
            this.currentlyChecked = false;
        } else {
            console.debug(`[${this.name}] Already driving -> ${value}`)
        }
    }

    isDriven(): boolean {
        return this.#value !== LogicValue.Z;
    }
}

export interface Positionable {
    pos_x: number;
    pos_y: number;
}

export abstract class AbstractNode implements IdHolder, Positionable {
    pos_x: number;
    pos_y: number;

    id: number;
    name: string;
    in_ports: InPort[];
    out_ports: OutPort[];

    constructor(name: string, n_in: number, n_out: number) {
        this.pos_x = 0;
        this.pos_y = 0;
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
        const a = this.in_ports[0].readPort();
        const out = this.out_ports[0];
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


export class Source extends AbstractNode {
    constructor() {
        super("Source", 0, 1);
    }

    set(v: LogicValue) {
        this.out_ports[0].writePort(v);
    }

    customUpdate(): void {
        return;
    }
}

export class Sink extends AbstractNode {
    callback;
    constructor(callback: (v: LogicValue) => void) {
        super("Sink", 1, 0);
        this.callback = callback;
    }

    get(): LogicValue {
        return this.in_ports[0].readPort();
    }

    customUpdate(): void {
        this.callback(this.get());
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

        //const n1 = new Inverter();
        //const button = new OutPort(0);
        //const wire1 = new Wire(button, n1.in_ports[0]);
        //const onUpdate: PortUpdateFunc = e => { console.log(`LED -> ${e?.readPort()}`) };
        //const led = new InPort(0, onUpdate)
        //const wire2 = new Wire(n1.out_ports[0], led);
        //console.log(n1);
        //console.log("Writing Inverter");
        //button.sendToConnection(LogicValue.LOW);
        //button.sendToConnection(LogicValue.HIGH);
        //button.sendToConnection(LogicValue.X);
        //button.sendToConnection(LogicValue.Z);


        const driver1 = new OutPort(0);
        const driver2 = new OutPort(1);
        const attachmentPoint = new MultiConnect();
        const sink1 = new InPort(0);
        //console.log(driver1, driver2, attachmentPoint, sink1);
        const wire1 = new Wire(driver1, attachmentPoint);
        const wire2 = new Wire(driver2, attachmentPoint);
        const wire3 = new Wire(attachmentPoint, sink1);
        //console.log(wire1, wire2, wire3);
        driver1.writePort(LogicValue.HIGH);
        //console.log(driver1, driver2, attachmentPoint, sink1);
        //console.log(wire1, wire2, wire3);
        driver2.writePort(LogicValue.HIGH);
        console.log(driver1, driver2, attachmentPoint, sink1);
        console.log(wire1, wire2, wire3);

        // const d1 = new Source();
        // const inv1 = new Inverter();
        // const s1 = new Sink((v)=>{
        //     console.log("Sink Updatet to "+v);
        // });
        // const w1 = new Wire(d1.out_ports[0], inv1.in_ports[0]);
        // const w2 = new Wire(inv1.out_ports[0], s1.in_ports[0]);
        // d1.set(LogicValue.HIGH);
    }
}

