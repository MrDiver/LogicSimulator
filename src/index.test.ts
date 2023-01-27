import { describe, it, expect } from 'vitest';
import { ConnectionType, InPort, Inverter, LogicValue, MultiConnect, OutPort, Sink, Source, Wire } from './components/simulator';


describe('Wire', () => {
    it('construct', () => {
        const g1 = new MultiConnect();
        const g2 = new MultiConnect();
        const w = new Wire(g1, g2);
        expect(w.conA).toEqual(g1);
        expect(w.conB).toEqual(g2);
        expect(g1.connections).toEqual([w]);
        expect(g2.connections).toEqual([w])
    });

    it('viewValue', () => {
        const g1 = new MultiConnect();
        const g2 = new MultiConnect();
        const w = new Wire(g1, g2);
        expect(w.viewValue()).toEqual(LogicValue.Z);
    })

    it('updateValue', () => {
        const g1 = new MultiConnect();
        const g2 = new MultiConnect();
        const w = new Wire(g1, g2);
        w.updateValue(g1, LogicValue.X);
        expect(w.viewValue()).toEqual(LogicValue.X);
        expect(g1.readValue(w)).toEqual(LogicValue.Z)
        expect(g2.readValue(w)).toEqual(LogicValue.X)
        w.updateValue(g2, LogicValue.HIGH);
        expect(g1.readValue(w)).toEqual(LogicValue.HIGH)
        expect(g2.readValue(w)).toEqual(LogicValue.X)
    })

    it('disconnectAll', () => {
        const g1 = new MultiConnect();
        const g2 = new MultiConnect();
        const w = new Wire(g1, g2);
        w.disconnectAll();
        expect(g1.connections).not.toContain(w);
        expect(g2.connections).not.toContain(w);
    })
});

describe('MultiConnect', () => {
    it('construct', () => {
        const mc = new MultiConnect();
        expect(mc.type).toEqual(ConnectionType.INOUT);
    })
    it('isDriving', () => {
        const mc = new MultiConnect();
        expect(mc.isDriving()).toBeFalsy();
    })
    it('connect', () => {
        const g1 = new MultiConnect();
        const g2 = new MultiConnect();
        const g3 = new MultiConnect();
        const g4 = new MultiConnect();
        const w1 = new Wire(g1, g2);
        const w2 = new Wire(g3, g4);
        g1.connect(w2)
        expect(g1.connections).toContain(w1)
        expect(g1.connections).toContain(w2)
    })
    it('disconnect', () => {
        const g1 = new MultiConnect();
        const g2 = new MultiConnect();
        const w1 = new Wire(g1, g2);
        g1.disconnect(w1);
        expect(g1.connections).not.toContain(w1);
    })
    it('readValue', () => {
        const g1 = new MultiConnect();
        const g2 = new MultiConnect();
        const w1 = new Wire(g1, g2);
        g1.lastValue = LogicValue.X;
        expect(g1.readValue(w1)).toEqual(LogicValue.X);
    })
    it('writeValue', () => {
        const g1 = new MultiConnect();
        const g2 = new MultiConnect();
        const w1 = new Wire(g1, g2);
        g1.writeValue(null as unknown as Wire, LogicValue.HIGH);
        expect(g1.lastValue).toEqual(LogicValue.HIGH);
        expect(w1.viewValue()).toEqual(LogicValue.HIGH);
        expect(g2.lastValue).toEqual(LogicValue.HIGH);
    })
})

describe('OutPort', () => {
    it('writeValue from outside', () => {
        const p1 = new OutPort(0, 'A1');
        const g2 = new MultiConnect();
        const w1 = new Wire(p1, g2);
        p1.writeValue(w1, LogicValue.HIGH);
        expect(p1.lastValue).toBe(LogicValue.Z);
    })
    it('writeValue from inside', () => {
        const p1 = new OutPort(0, 'A1');
        const c1 = new Inverter();
        p1.writeValue(c1, LogicValue.HIGH);
        expect(p1.lastValue).toEqual(LogicValue.HIGH);
    })
})

describe('InPort', () => {
    it('writeValue from outside', () => {
        const p1 = new InPort(0, 'A1', () => { return });
        const g2 = new MultiConnect();
        const w1 = new Wire(p1, g2);
        p1.writeValue(w1, LogicValue.HIGH);
        expect(p1.lastValue).toEqual(LogicValue.HIGH);
    })
    it('writeValue from inside', () => {
        const p1 = new InPort(0, 'A1', () => { return });
        const c1 = new Inverter();
        expect(() => p1.writeValue(c1, LogicValue.HIGH)).toThrowError();
    })

    it('writeValue twice update once', () => {
        let count = 0;
        const p1 = new InPort(0, 'A1', () => { count++ });
        const g2 = new MultiConnect();
        const w1 = new Wire(p1, g2);
        p1.writeValue(w1, LogicValue.HIGH);
        p1.writeValue(w1, LogicValue.HIGH);
        expect(count).toEqual(1);
    })
})


//----------------------------------------------------
//
//                    Components
//
//----------------------------------------------------

describe('Circuits',()=>{
    it('Basic inverter circuit',()=>{
        const source1 = new Source();
        const inv1 = new Inverter();
        const sink1 = new Sink();
        const w1 = new Wire(source1.getOutput(0),inv1.getInput(0));
        const w2 = new Wire(inv1.getOutput(0),sink1.getInput(0));
        source1.setValue(LogicValue.HIGH);
        expect(sink1.getValue()).toBe(LogicValue.LOW);
        source1.setValue(LogicValue.LOW);
        expect(sink1.getValue()).toBe(LogicValue.HIGH);
    })
})
