import { writable, type Writable } from "svelte/store";

export enum ConnectionType {
    IN,
    OUT,
    INOUT,
}

export enum LogicValue {
    HIGH = "1",
    LOW = "0",
    X = "X",
    Z = "Z",
}

type Constructor<T> = new (...args: any[]) => T;

function IdBase<TBase extends Constructor<object>>(Base: TBase) {
    return class IdBase extends Base {
        static #_id_count = 0;
        id: number;
        constructor(...args: any[]) {
            super(...args)
            this.id = IdBase.#_id_count++;
        }
    }
}

function CanUpdate<TBase extends Constructor<object>>(Base: TBase) {
    return class CanUpdate extends Base {
        #instance: Writable<this>
        constructor(...args: any[]) {
            super(...args);
            this.#instance = writable(this);
        }
        triggerUpdateSelf(): void {
            this.#instance.set(this);
            this.customUpdateCallback();
        }
        customUpdateCallback(): void {
            return;
        }
        getStore(): Writable<this> {
            return this.#instance;
        }
    }
}

function AutoUpdateView<TBase extends Constructor<object>>(Base: TBase) {
    return class AutoUpdateView extends CanUpdate(Base) {
        x: number;
        y: number;
        constructor(...args: any[]) {
            super(...args);
            this.x = 0;
            this.y = 0;
        }
        setPos(x: number, y: number) {
            this.x = x;
            this.y = y;
            this.triggerUpdateSelf();
        }
    }
}

// ---------------------------------------------------------------------
//
//                           Base Classes
//
// ---------------------------------------------------------------------

export abstract class Connector extends AutoUpdateView(IdBase(Object)) {
    type: ConnectionType;
    connections: Wire[];
    constructor(type: ConnectionType) {
        super();
        this.type = type;
        this.connections = [];
    }
    abstract isDriving(): boolean;
    abstract connect(wire: Wire): void;
    abstract disconnect(wire: Wire): void;
    abstract readValue(caller: Wire | Component | Connector): LogicValue;
    abstract writeValue(caller: Wire | Component, v: LogicValue): void;
    abstract getDrivers(sender: Wire | Component): Connector[];
}

export abstract class Component extends AutoUpdateView(IdBase(Object)) {
    name: string;
    in_pins: InPort[];
    out_pins: OutPort[];
    constructor(name = "") {
        super();
        this.name = name;
        this.in_pins = [];
        this.out_pins = [];
    }
    protected addInputPin(name = '') {
        this.in_pins.push(new InPort(this.in_pins.length, name, this.internalCallback.bind(this)));
    }
    protected addOutputPin(name = '') {
        this.out_pins.push(new OutPort(this.in_pins.length, name));
    }
    getInput(index: number) {
        if (0 <= index && index < this.in_pins.length) {
            return this.in_pins[index];
        }
        throw RangeError(`The value ${index} is not in Range for Component ${this.name} with ${this.in_pins.length} Inputs`);
    }
    getOutput(index: number) {
        if (0 <= index && index < this.out_pins.length) {
            return this.out_pins[index];
        }
        throw RangeError(`The value ${index} is not in Range for Component ${this.name} with ${this.out_pins.length} Inputs`);
    }
    internalCallback(source: Connector) {
        this.onInputChange(source);
        this.triggerUpdateSelf();
    }
    abstract onInputChange(source: Connector): void;
}

// ---------------------------------------------------------------------
//
//                           Implementations
//
// ---------------------------------------------------------------------

export class Wire extends AutoUpdateView(IdBase(Object)) {
    #lastValue: LogicValue;
    conA: Connector;
    conB: Connector;
    constructor(conA: Connector, conB: Connector) {
        super();
        this.conA = conA;
        this.conB = conB;
        conA.connect(this);
        conB.connect(this);
        this.#lastValue = LogicValue.Z;
    }
    viewValue(): LogicValue {
        return this.#lastValue;
    }
    updateValue(source: Connector, v: LogicValue) {
        if (this.#lastValue === v) {
            return;
        }
        this.#lastValue = v;
        if (this.conA === source) {
            this.conB.writeValue(this, v);
        } else if (this.conB === source) {
            this.conA.writeValue(this, v);
        }
        this.triggerUpdateSelf();
    }
    disconnectAll() {
        this.conA.disconnect(this);
        this.conB.disconnect(this);
    }
    getDrivers(sender: Connector): Connector[] {
        if (sender.id === this.conA.id) {
            return this.conB.getDrivers(this);
        } else if (sender.id === this.conB.id) {
            return this.conA.getDrivers(this);
        } else {
            throw new Error("This shouldn't have happened");
        }
    }
}

class GeneralConnector extends Connector {
    lastValue: LogicValue;
    #currentlyChecked: boolean;
    constructor(type: ConnectionType) {
        super(type);
        this.lastValue = LogicValue.Z;
        this.#currentlyChecked = false;
    }
    protected lock() {
        this.#currentlyChecked = true;
    }
    protected unlock() {
        this.#currentlyChecked = false;
    }
    protected isLocked() {
        return this.#currentlyChecked;
    }
    isDriving(): boolean {
        if (this.type === ConnectionType.OUT) {
            return this.lastValue !== LogicValue.Z
        } else {
            return false;
        }
    }
    connect(wire: Wire): void {
        if (this.type === ConnectionType.IN) {
            this.connections = [wire];
        } else {
            this.disconnect(wire);
            this.connections.push(wire);
        }
    }
    private findWire(wire: Wire): number {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return this.connections.findIndex((w, _): boolean => w.id === wire.id);
    }
    disconnect(wire: Wire): void {
        let idx = this.findWire(wire);
        while (idx !== -1) {
            this.connections.splice(idx, 1);
            idx = this.findWire(wire);
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    readValue(caller: Component | Wire | Connector): LogicValue {
        return this.lastValue;
    }
    writeValue(caller: Component | Wire, v: LogicValue): void {

        const drivers = this.getDrivers(caller);
        this.lock();

        if (v === LogicValue.Z && drivers.length === 1) {
            this.lastValue = drivers[0].readValue(this);
            this.triggerUpdateSelf();
            this.connections.forEach(w => w.updateValue(this, this.lastValue));
        } else if (drivers.length > 0) {
            this.lastValue = LogicValue.X;
            this.triggerUpdateSelf();
            this.connections.forEach(w => w.updateValue(this, LogicValue.X));
        } else {
            this.lastValue = v;
            this.triggerUpdateSelf();
            for (const conn of this.connections) {
                if (conn !== caller) {
                    conn.updateValue(this, v)
                }
            }
        }
        this.unlock();

    }
    getDrivers(sender: Wire | Component): Connector[] {
        if (this.isLocked()) {
            return [];
        }
        let drivers: Connector[] = []
        this.lock();
        for (const wire of this.connections) {
            if (wire !== sender) {
                drivers = drivers.concat(wire.getDrivers(this));
            }
        }
        this.unlock();
        return drivers;
    }
}

export class MultiConnect extends GeneralConnector {
    constructor() {
        super(ConnectionType.INOUT);
    }
}

export class Port extends GeneralConnector {
    port_id: number;
    port_name: string;
    constructor(port_type: ConnectionType, port_id: number, port_name: string) {
        super(port_type);
        this.port_id = port_id;
        this.port_name = port_name;
    }
}

export class OutPort extends Port {
    constructor(port_id: number, port_name = '') {
        super(ConnectionType.OUT, port_id, port_name);
    }
    override writeValue(caller: Wire | Component, v: LogicValue): void {
        if (caller instanceof Wire && this.type === ConnectionType.OUT) {
            //throw Error("Tried to write OutPort from outside a Component")
            return;
        }
        this.lock();
        super.writeValue(caller, v);
        this.unlock();
    }
    override connect(w: Wire): void {
        super.connect(w);
        if (this.isDriving()) {
            w.updateValue(this, this.lastValue);
        }
    }
    override getDrivers(w: Wire): Connector[] {
        if (this.isLocked()) {
            return [];
        }
        return this.isDriving() ? [this] : [];
    }
}

export class InPort extends Port {
    callback: (p: InPort) => void;
    constructor(port_id: number, port_name = '', callback: (p: InPort) => void) {
        super(ConnectionType.IN, port_id, port_name);
        this.callback = callback;
    }
    override readValue(caller: Wire | Component | Connector): LogicValue {
        if (caller instanceof Wire && this.type === ConnectionType.IN) {
            return LogicValue.Z;
        }
        return super.readValue(caller);
    }
    override writeValue(caller: Wire | Component, v: LogicValue): void {
        if (caller instanceof Component && this.type === ConnectionType.IN) {
            throw Error("Tried to write InPort from inside a Component");
        }
        if (this.lastValue !== v) {
            super.writeValue(caller, v);
            this.callback(this);
        }
    }
    override getDrivers(w: Wire): Connector[] {
        return [];
    }
}


//----------------------------------------------------
//
//                    Components
//
//----------------------------------------------------

export class Sink extends Component {
    constructor() {
        super('Sink');
        this.addInputPin('Sink');
    }
    onInputChange(source: Connector): void {
        //console.log("SINK: " + this.getInput(0).readValue(this))
        return;
    }
    getValue(): LogicValue {
        return this.getInput(0).readValue(this);
    }
}

export class Source extends Component {
    constructor() {
        super('Source');
        this.addOutputPin('Source');
    }
    onInputChange(source: Connector): void {
        return;
    }
    setValue(v: LogicValue) {
        this.getOutput(0).writeValue(this, v);
    }
}

export class Inverter extends Component {
    constructor() {
        super('Inverter');
        this.addInputPin('Q');
        this.addOutputPin('Q\'');
    }
    override onInputChange(source: Connector): void {
        const in_pin = this.getInput(0);
        const out_pin = this.getOutput(0);
        switch (in_pin.readValue(this)) {
            case LogicValue.Z: { out_pin.writeValue(this, LogicValue.X); break; }
            case LogicValue.X: { out_pin.writeValue(this, LogicValue.X); break; }
            case LogicValue.HIGH: { out_pin.writeValue(this, LogicValue.LOW); break; }
            case LogicValue.LOW: { out_pin.writeValue(this, LogicValue.HIGH); break; }
        }
    }
}


export class TestMain {
    main() {
        console.log("Test");
        const source1 = new Source();
        const source2 = new Source();
        const multi = new MultiConnect();
        const sink = new Sink();
        const w1 = new Wire(source1.getOutput(0), multi);
        const w2 = new Wire(source2.getOutput(0), multi);
        const w3 = new Wire(multi, sink.getInput(0));
        console.log(w1, w2, w3, source1, source2, sink);
        source1.setValue(LogicValue.HIGH);
        source2.setValue(LogicValue.LOW);
        source2.setValue(LogicValue.Z);
    }
}
