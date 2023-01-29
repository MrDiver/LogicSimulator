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

class HasLM {
    lm: LM;
    constructor(lm: LM) {
        this.lm = lm;
    }
}
class IdBase extends HasLM {
    id: number;
    constructor(lm: LM, id = null) {
        super(lm)
        this.id = id === null ? lm.id++ : id;
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
            console.debug("[CanUpdate] Triggered self update");
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

const CompositeClass = AutoUpdateView(IdBase);
// ---------------------------------------------------------------------
//
//                           Base Classes
//
// ---------------------------------------------------------------------

type WireID = number;
type ConnectorID = number;
type ComponentID = number;
export abstract class Connector extends CompositeClass {
    type: ConnectionType;
    connections: WireID[];
    constructor(lm: LM, type: ConnectionType) {
        super(lm);
        this.type = type;
        this.connections = [];
    }
    abstract isDriving(): boolean;
    abstract connect(wire: WireID): void;
    abstract disconnect(wire: WireID): void;
    abstract postDisconnect(wire: WireID): void;
    abstract readValue(caller: WireID | ComponentID | ConnectorID): LogicValue;
    abstract writeValue(caller: WireID | ComponentID, v: LogicValue): void;
    abstract getDrivers(sender: WireID | ComponentID): ConnectorID[];
}

export abstract class Component extends CompositeClass {
    name: string;
    in_pins: ConnectorID[];
    out_pins: ConnectorID[];
    constructor(lm: LM, name = "") {
        super(lm);
        this.name = name;
        this.in_pins = [];
        this.out_pins = [];
    }
    protected addInputPin(name = '') {
        console.debug(`[Component(${this.name})${this.id}] Add Input Pin`)
        this.in_pins.push(this.lm.createInPort(this.in_pins.length, name, this.internalCallback.bind(this)));
    }
    protected addOutputPin(name = '') {
        console.debug(`[Component(${this.name})${this.id}] Add Output Pin`)
        this.out_pins.push(this.lm.createOutPort(this.in_pins.length, name));
    }
    getInput(index: number): InPort {
        console.debug(`[Component(${this.name})${this.id}] Requested InPort ${index}`)
        if (0 <= index && index < this.in_pins.length) {
            return this.lm.getInPort(this.in_pins[index]);
        }
        throw RangeError(`The value ${index} is not in Range for Component ${this.name} with ${this.in_pins.length} Inputs`);
    }
    getOutput(index: number): OutPort {
        console.debug(`[Component(${this.name})${this.id}] Requested OutPort ${index}`)
        if (0 <= index && index < this.out_pins.length) {
            return this.lm.getOutPort(this.out_pins[index]);
        }
        throw RangeError(`The value ${index} is not in Range for Component ${this.name} with ${this.out_pins.length} Outputs`);
    }
    internalCallback(source: ConnectorID) {
        console.debug(`[Component(${this.name})${this.id}] Update triggered by Input Connector${source}`)
        this.onInputChange(source);
        this.triggerUpdateSelf();
    }
    abstract onInputChange(source: ConnectorID): void;
}

// ---------------------------------------------------------------------
//
//                           Implementations
//
// ---------------------------------------------------------------------

export class Wire extends CompositeClass {
    lastValue: LogicValue;
    conA: ConnectorID;
    conB: ConnectorID;
    constructor(lm: LM, conA: ConnectorID, conB: ConnectorID) {
        super(lm);
        lm.addWire(this);
        console.debug(`[Wire${this.id}] Constructing Wire (Connector${conA}, Connector${conB}`);
        this.conA = conA;
        this.conB = conB;
        const nodeA = this.lm.getConnector(this.conA)
        const nodeB = this.lm.getConnector(this.conB)
        nodeA.connect(this.id);
        nodeB.connect(this.id);
        this.lastValue = LogicValue.Z;
        const a = nodeA.readValue(this.id);
        const b = nodeB.readValue(this.id);
        let count = 0
        let con: Connector | null = null;
        if (a !== LogicValue.Z) {
            this.lastValue = a;
            count++;
            con = nodeB;
        }
        if (b !== LogicValue.Z) {
            this.lastValue = b;
            count++;
            con = nodeA;
        }
        if (count > 1) {
            this.lastValue = LogicValue.X;
            nodeA.writeValue(this.id, this.lastValue);
            nodeB.writeValue(this.id, this.lastValue);
        } else {
            if (con)
                con.writeValue(this.id, this.lastValue);
        }
        this.triggerUpdateSelf();
    }
    readValue(): LogicValue {
        return this.lastValue;
    }
    updateValue(source: ConnectorID, v: LogicValue) {
        console.debug(`[Wire${this.id}] Value updated from Connector${source}`);
        if (this.id === -1) return;
        if (this.lastValue === v) {
            return;
        }
        this.lastValue = v;
        if (this.conA === source) {
            this.lm.getConnector(this.conB).writeValue(this.id, v);
        } else if (this.conB === source) {
            this.lm.getConnector(this.conA).writeValue(this.id, v);
        }
        this.triggerUpdateSelf();
    }
    disconnectAll() {
        console.group(`[Wire${this.id}] Disconnecting all`);
        const nodeA = this.lm.getConnector(this.conA);
        const nodeB = this.lm.getConnector(this.conB);
        nodeA.disconnect(this.id);
        nodeB.disconnect(this.id);
        nodeA.postDisconnect(this.id);
        nodeB.postDisconnect(this.id);
        this.id = -1;
        this.lastValue = LogicValue.Z;
        console.groupEnd();
        this.triggerUpdateSelf();
    }
    getDrivers(sender: ConnectorID): ConnectorID[] {
        console.debug(`[Wire${this.id}] Drivers Requested from Connector${sender}`);
        if (this.id === -1) return [];
        if (sender === this.conA) {
            return this.lm.getConnector(this.conB).getDrivers(this.id);
        } else if (sender === this.conB) {
            return this.lm.getConnector(this.conA).getDrivers(this.id);
        } else {
            throw new Error("This shouldn't have happened");
        }
    }
}

class GeneralConnector extends Connector {
    lastValue: LogicValue;
    #currentlyChecked: boolean;
    constructor(lm: LM, type: ConnectionType) {
        super(lm, type);
        this.lastValue = LogicValue.Z;
        this.#currentlyChecked = false;
    }
    protected lock() {
        console.group(`[Connector${this.id}] lock()`);
        this.#currentlyChecked = true;
    }
    protected unlock() {
        console.debug(`[Connector${this.id}] unlock()`);
        console.groupEnd()
        this.#currentlyChecked = false;
    }
    protected isLocked() {
        return this.#currentlyChecked;
    }
    protected spreadValue(v: LogicValue) {
        console.debug(`[Connector${this.id}] spreadValue ${v}`);
        this.lock();
        this.connections.forEach(w => this.lm.getWire(w).updateValue(this.id, v));
        this.unlock();
    }
    isDriving(): boolean {
        if (this.type === ConnectionType.OUT) {
            return this.lastValue !== LogicValue.Z
        } else {
            return false;
        }
    }
    connect(wire: WireID): void {
        console.debug(`[Connector${this.id}] Connecting Wire${wire}`);
        if (this.type === ConnectionType.IN) {
            this.connections.forEach(w => this.lm.getWire(w).disconnectAll());
            this.connections = [wire];
        } else {
            this.disconnect(wire);
            this.connections.push(wire);
        }
    }
    private findWire(wire: WireID): number {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return this.connections.findIndex((w, _): boolean => w === wire);
    }
    disconnect(wire: WireID): void {
        console.debug(`[Connector${this.id}] Disconnecting Wire${wire}`);
        let idx = this.findWire(wire);
        while (idx !== -1) {
            this.connections.splice(idx, 1);
            idx = this.findWire(wire);
        }
    }
    postDisconnect(wire: WireID): void {
        console.debug(`[Connector${this.id}] Post Process Disconnecting Wire${wire}`);
        return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    readValue(caller: ComponentID | WireID | ConnectorID): LogicValue {
        console.debug(`[Connector${this.id}] Value Requested from Caller${caller}`);
        return this.lastValue;
    }
    writeValue(caller: ComponentID | WireID, v: LogicValue): void {
        console.debug(`[Connector${this.id}] Write Requested from Caller${caller} (${this.lastValue} -> ${v})`);
        const drivers = this.getDrivers(caller);

        if (v === LogicValue.Z && drivers.length === 1) {
            console.debug(`[Connector${this.id}] Caller disconnected now using Connector${drivers[0]} as Driver`);
            this.lastValue = this.lm.getConnector(drivers[0]).readValue(this.id);
            this.triggerUpdateSelf();
            this.spreadValue(this.lastValue);
        } else if (drivers.length > 0) {
            console.debug(`[Connector${this.id}] Invalidating too many drivers`);
            this.lastValue = LogicValue.X;
            this.triggerUpdateSelf();
            this.spreadValue(LogicValue.X);
        } else {
            console.debug(`[Connector${this.id}] Accepting Write (${this.lastValue} -> ${v})`);
            this.lastValue = v;
            this.triggerUpdateSelf();
            for (const wire of this.connections) {
                if (wire !== caller) {
                    this.lock();
                    this.lm.getWire(wire).updateValue(this.id, v)
                    this.lock();
                }
            }
        }

    }
    getDrivers(sender: WireID | ComponentID): ConnectorID[] {
        console.debug(`[Connector${this.id}] Requested Drivers from Caller${sender}`);
        if (this.isLocked()) {
            return [];
        }
        let drivers: ConnectorID[] = []
        this.lock();
        for (const wire of this.connections) {
            if (wire !== sender) {
                drivers = drivers.concat(this.lm.getWire(wire).getDrivers(this.id));
            }
        }
        this.unlock();
        return drivers;
    }
}

export class MultiConnect extends GeneralConnector {
    constructor(lm: LM) {
        super(lm, ConnectionType.INOUT);
    }
}

export class Port extends GeneralConnector {
    port_id: number;
    port_name: string;
    constructor(lm: LM, port_type: ConnectionType, port_id: number, port_name: string) {
        super(lm, port_type);
        this.port_id = port_id;
        this.port_name = port_name;
    }
}

export class OutPort extends Port {
    constructor(lm: LM, port_id: number, port_name = '') {
        super(lm, ConnectionType.OUT, port_id, port_name);
    }
    override writeValue(caller: WireID | ComponentID, v: LogicValue): void {
        if (this.lm.isWire(caller)) {
            console.debug(`[OutPort${this.id}] Skipping write from Wire{caller} Checking for invalidation`);
            if (this.isDriving() && v !== LogicValue.Z) {
                super.spreadValue(LogicValue.X);
            }
            return;
        }
        console.debug(`[OutPort${this.id}] Accepting Write from Caller${caller} Checking for invalidation`);
        this.lock();
        // let incoming = this.connections.map(w => w.getDrivers(this));
        // let drivers = incoming.reduce((a,b) => a.concat(b));
        // console.debug("%c ARRAY","color:red",drivers);
        super.writeValue(caller, v);
        this.unlock();
    }
    override disconnect(wire: WireID): void {
        super.disconnect(wire);
    }
    override postDisconnect(wire: WireID): void {
        console.debug(`[OutPort${this.id}] Post Processing Disconnecting Wire${wire}`);
        this.spreadValue(this.lastValue);
    }
    override connect(wire: WireID): void {
        console.debug(`[OutPort${this.id}] Connecting to Wire${wire}`);
        super.connect(wire);
        // if (this.isDriving()) {
        //     w.updateValue(this, this.lastValue);
        // }
    }
    override getDrivers(wire: WireID): ConnectorID[] {
        console.debug(`[OutPort${this.id}] Requested Drivers from Wire${wire}`);
        if (this.isLocked()) {
            return [];
        }
        return this.isDriving() ? [this.id] : [];
    }
}

export class InPort extends Port {
    callback: (p: ConnectorID) => void;
    constructor(lm: LM, port_id: number, port_name = '', callback: (p: ConnectorID) => void) {
        super(lm, ConnectionType.IN, port_id, port_name);
        this.callback = callback;
    }
    override readValue(caller: WireID | ComponentID | ConnectorID): LogicValue {
        console.debug(`[InPort${this.id}] Value Requested from Caller${caller}`);
        if (this.lm.isWire(caller) && this.type === ConnectionType.IN) {
            return LogicValue.Z;
        }
        return super.readValue(caller);
    }
    override writeValue(caller: WireID | ComponentID, v: LogicValue): void {
        console.debug(`[InPort${this.id}] Write Requested from Caller${caller}`);
        if (this.lm.isComponent(caller) && this.type === ConnectionType.IN) {
            throw Error("Tried to write InPort from inside a Component");
        }
        if (this.lastValue !== v) {
            super.writeValue(caller, v);
            this.callback(this.id);
        }
    }
    override disconnect(wire: WireID): void {
        console.debug(`[InPort${this.id}] Disconnecting from Wire${wire}`);
        super.disconnect(wire);
    }
    override postDisconnect(wire: WireID): void {
        this.writeValue(this.id, LogicValue.Z);
    }
    override getDrivers(w: WireID): ConnectorID[] {
        return [];
    }
}

export interface WireDto {
    id: number;
    a_id: number;
    b_id: number;
}

export interface ComponentDto {
    x: number;
    y: number;
    id: number;
    type: string;
    in_pins: { id: number, val: LogicValue }[];
    out_pins: { id: number, val: LogicValue }[];
}

//----------------------------------------------------
//
//                    Components
//
//----------------------------------------------------

export class UnknownComponent extends Component {
    constructor(lm: LM) {
        super(lm, 'Unknown');
    }
    onInputChange(source: number): void {
        return
    }
}

export class Sink extends Component {
    constructor(lm: LM) {
        super(lm, 'Sink');
        this.addInputPin('Sink');
    }
    onInputChange(source: ConnectorID): void {
        //console.log("SINK: " + this.getInput(0).readValue(this))
        return;
    }
    getValue(): LogicValue {
        return this.getInput(0).readValue(this.id);
    }
}

export class Source extends Component {
    constructor(lm: LM) {
        super(lm, 'Source');
        this.addOutputPin('Source');
    }
    onInputChange(source: ConnectorID): void {
        return;
    }
    setValue(v: LogicValue) {
        this.getOutput(0).writeValue(this.id, v);
    }
}

export class Inverter extends Component {
    constructor(lm: LM) {
        super(lm, 'Inverter');
        this.addInputPin('Q');
        this.addOutputPin('Q\'');
    }
    override onInputChange(source: ConnectorID): void {
        const in_pin = this.getInput(0);
        const out_pin = this.getOutput(0);
        switch (in_pin.readValue(this.id)) {
            case LogicValue.Z: { out_pin.writeValue(this.id, LogicValue.X); break; }
            case LogicValue.X: { out_pin.writeValue(this.id, LogicValue.X); break; }
            case LogicValue.HIGH: { out_pin.writeValue(this.id, LogicValue.LOW); break; }
            case LogicValue.LOW: { out_pin.writeValue(this.id, LogicValue.HIGH); break; }
        }
    }
}

export class LM {
    wires: Map<number, Wire> = new Map();
    components: Map<number, Component> = new Map();
    connectors: Map<number, GeneralConnector> = new Map();
    id = 0;
    isLocked = false;
    filterWires() {
        const toDelete: number[] = [];
        this.wires.forEach((v: Wire, k: number) => {
            if (v.id === -1) {
                toDelete.push(k);
            }
        });
        toDelete.forEach((i) => this.wires.delete(i));
    }
    isWire(id: number): boolean {
        return this.wires.has(id);
    }
    isComponent(id: number): boolean {
        return this.components.has(id);
    }
    isConnector(id: number): boolean {
        return this.connectors.has(id);
    }
    getWire(id: number): Wire {
        const w = this.wires.get(id);
        if (w instanceof Wire) {
            return w
        }
        throw Error(`Wire with id ${id} doesn't exist`);
    }
    getComponent(id: number): Component {
        const res = this.components.get(id);
        if (res instanceof Component) {
            return res;
        }
        throw Error(`Component with id ${id} doesn't exist`);
    }
    getConnector(id: number): GeneralConnector {
        const res = this.connectors.get(id);
        if (res instanceof Connector) {
            return res;
        }
        throw Error(`Connector with id ${id} doesn't exist`);
    }
    addComponent<T extends Component>(c: T): T {
        this.components.set(c.id, c);
        return c;
    }
    addWire<T extends Wire>(w: T): T {
        this.wires.set(w.id, w);
        this.filterWires();
        return w;
    }
    addConnector<T extends GeneralConnector>(c: T): T {
        this.connectors.set(c.id, c);
        return c;
    }
    createComponent<T extends Component>(c: new (...args: any[]) => T): T {
        const node = new c(this);
        this.addComponent(node);
        return node
    }
    createConnector<T extends GeneralConnector>(c: new (...args: any[]) => T, id: number | null = null): ConnectorID {
        if (this.isLocked) {
            return -1;
        }
        const node = new c(this);
        node.id = id || node.id;
        this.addConnector(node);
        return node.id
    }
    createWire(c1: ConnectorID, c2: ConnectorID): WireID {
        if (this.isLocked) {
            return -1;
        }
        const wire = new Wire(this, c1, c2);
        this.filterWires();
        return wire.id;
    }
    createInPort(port_id: number, port_name: string, callback: (caller: ConnectorID) => void, id: number | null = null): ConnectorID {
        if (this.isLocked) {
            return -1;
        }
        const port = new InPort(this, port_id, port_name, callback);
        port.id = id || port.id;
        this.connectors.set(port.id, port)
        return port.id
    }
    createOutPort(port_id: number, port_name: string, id: number | null = null): ConnectorID {
        if (this.isLocked) {
            return -1;
        }
        const port = new OutPort(this, port_id, port_name);
        port.id = id || port.id;
        this.connectors.set(port.id, port)
        return port.id
    }
    getInPort(id: number): InPort {
        const res = this.connectors.get(id);
        if (res instanceof InPort) {
            return res;
        }
        throw Error(`InPort with id ${id} doesn't exist`);
    }
    getOutPort(id: number): OutPort {
        const res = this.connectors.get(id);
        if (res instanceof OutPort) {
            return res;
        }
        throw Error(`OutPort with id ${id} doesn't exist`);
    }
    getDto(): LMDto {
        const wires = []
        for (const w of this.wires.values()) {
            wires.push({ className: w.constructor.name, value: w });
        }
        const components = []
        for (const c of this.components.values()) {
            components.push({ className: c.constructor.name, value: c, onInputChange: 'return function ' + c.onInputChange.toString() });
        }
        const connectors = []
        for (const c of this.connectors.values()) {
            connectors.push({ className: c.constructor.name, value: c });
        }
        return { wires, components, connectors };
    }
    fromDto(dto: LMDto): void {
        console.debug("DTO", dto);
        this.wires.clear();
        this.components.clear();
        this.connectors.clear();
        // Process Components

        dto.connectors.forEach(c => {
            let pid = -1;
            switch (c.value.type as ConnectionType) {
                case ConnectionType.IN: pid = this.createInPort((c.value as InPort).port_id, (c.value as InPort).port_name, () => { return }, c.value.id); break;
                case ConnectionType.OUT: pid = this.createOutPort((c.value as OutPort).port_id, (c.value as InPort).port_name, c.value.id); break;
                case ConnectionType.INOUT: pid = this.createConnector(MultiConnect, c.value.id); break;
            }
            if (pid != c.value.id) {
                throw Error("Something went terribly wrong here");
            }
            const pin = this.getConnector(pid);
            pin.lastValue = c.value.lastValue;
        })

        dto.components.forEach(c => {
            let construct;
            switch (c.className) {
                case "Source": construct = Source; break;
                case "Sink": construct = Sink; break;
                case "Inverter": construct = Inverter; break;
                default: construct = UnknownComponent; break;
            }
            this.isLocked = true;
            const new_node: Component = this.createComponent(construct);
            this.isLocked = false;

            new_node.x = c.value.x;
            new_node.y = c.value.y;
            new_node.y = c.value.y;
            new_node.in_pins = c.value.in_pins;
            new_node.out_pins = c.value.out_pins;

            new_node.in_pins.forEach(p => {
                const pin = this.getConnector(p);
                if (pin.type === ConnectionType.IN) {
                    (pin as InPort).callback = new_node.onInputChange.bind(new_node);
                }
            })
            // TODO: Function synthesis
            // console.log(c.onInputChange)
            // new_node.onInputChange = new Function(c.onInputChange)().bind(new_node);
        })

        dto.wires.forEach(w => {
            this.createWire(w.value.conA, w.value.conB);
        })
        console.debug("LM", this);
    }
}

export interface LMDto {
    wires: { className: string, value: Wire }[];
    components: { className: string, value: Component, onInputChange: string }[];
    connectors: { className: string, value: GeneralConnector }[];
}

export class TestMain {
    main() {
        console.log("Test");
        const lm = new LM();
        const source1 = lm.createComponent(Source);
        const source2 = lm.addComponent(new Source());
        const multi = lm.addConnector(new MultiConnect());
        const sink = lm.addComponent(new Sink());
        const inv1 = lm.addComponent(new Inverter());
        const w1 = lm.addWire(new Wire(source1.out_pins[0], multi.id));
        const w2 = lm.addWire(new Wire(source2.out_pins[0], multi.id));
        const w3 = lm.addWire(new Wire(multi.id, inv1.in_pins[0]));
        const w4 = lm.addWire(new Wire(inv1.out_pins[0], sink.in_pins[0]));
        console.log(w1, w2, w3, source1, source2, sink);
        source1.setValue(LogicValue.HIGH);
        source2.setValue(LogicValue.LOW);
        source2.setValue(LogicValue.Z);
        console.log(w1, w2, w3, source1, source2, sink);
        console.log(JSON.stringify(lm.toJSON(), null, 2))
    }
}
