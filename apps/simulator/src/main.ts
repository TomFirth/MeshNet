import * as PIXI from 'pixi.js';
import { SyncEngine, MessageRepository, DatabaseDriver, Message } from '@meshnet/protocol';
import { v4 as uuidv4 } from 'uuid';

class SimulationDriver implements DatabaseDriver {
  public messages: Message[] = [];
  async execute(sql: string, params: any[] = []): Promise<void> {
    const sql_up = sql.toUpperCase();
    if (sql_up.includes('INTO MESSAGES')) {
      if (!this.messages.find(m => m.id === params[0])) {
        this.messages.push({
          id: params[0], channelId: params[1], senderId: params[2],
          timestamp: params[3], expiry: params[4], priority: params[5],
          payload: params[6]
        });
      }
    }
    return Promise.resolve();
  }
  async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    const sql_up = sql.toUpperCase();
    if (sql_up.includes('FROM MESSAGES')) {
        let res = [...this.messages];
        if (sql_up.includes('WHERE CHANNEL_ID') && params[0]) res = res.filter(m => m.channelId === params[0]);
        return res.sort((a,b) => b.timestamp - a.timestamp).slice(0, 100) as any;
    }
    return [] as T[];
  }
}

class SimTransport {
    constructor(private world: World, private senderId: string) {}
    async sendInventory(peerId: string, msgIds: string[]) {
        const peer = this.world.nodes.get(peerId);
        if (peer) setTimeout(() => peer.engine.onInventoryReceived(this.senderId, msgIds, new SimTransport(this.world, peerId)), 30);
    }
    async requestMessages(peerId: string, msgIds: string[]) {
        const peer = this.world.nodes.get(peerId);
        if (peer) setTimeout(() => peer.engine.onMessagesRequested(this.senderId, msgIds, new SimTransport(this.world, peerId)), 30);
    }
    async sendMessages(peerId: string, messages: Message[]) {
        const peer = this.world.nodes.get(peerId);
        if (peer) {
            await peer.engine.onMessagesReceived(messages);
            peer.isSyncing = false;
        }
    }
}

class SimulatedNode {
    public id: string;
    public x: number; y: number; vx: number; vy: number;
    public engine: SyncEngine;
    public driver: SimulationDriver;
    public graphic: PIXI.Graphics;
    public rangeGraphic: PIXI.Graphics;
    public lastSyncs: Map<string, number> = new Map();
    public isSyncing = false;

    constructor(id: string, x: number, y: number) {
        this.id = id; this.x = x; this.y = y;
        this.vx = (Math.random() - 0.5) * 2; this.vy = (Math.random() - 0.5) * 2;
        this.driver = new SimulationDriver();
        this.engine = new SyncEngine(new MessageRepository(this.driver), id);
        this.graphic = new PIXI.Graphics();
        this.rangeGraphic = new PIXI.Graphics();
        this.graphic.interactive = true;
        this.graphic.on('pointerdown', () => (window as any).inspect(this.id));
    }

    draw(color: number, isSelected: boolean) {
        this.graphic.clear();
        if (isSelected) {
            this.graphic.lineStyle(2, 0xffffff);
            this.rangeGraphic.alpha = 0.5;
        } else {
            this.graphic.lineStyle(0);
            this.rangeGraphic.alpha = 0.1;
        }
        this.graphic.beginFill(color);
        this.graphic.drawCircle(0, 0, 7);
        this.graphic.endFill();

        this.rangeGraphic.clear();
        this.rangeGraphic.lineStyle(1, isSelected ? 0xffcc00 : 0x444444);
        this.rangeGraphic.drawCircle(0, 0, 70);
    }

    update(w: number, h: number) {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 20 || this.x > w - 20) this.vx *= -1;
        if (this.y < 20 || this.y > h - 20) this.vy *= -1;
        this.graphic.x = this.x; this.graphic.y = this.y;
        this.rangeGraphic.x = this.x; this.rangeGraphic.y = this.y;
    }
}

class World {
    public nodes: Map<string, SimulatedNode> = new Map();
    private app: PIXI.Application;
    private seedMsgId: string | null = null;
    private selectedId: string | null = null;

    constructor() {
        this.app = new PIXI.Application({ width: window.innerWidth, height: window.innerHeight, backgroundColor: 0x111111, antialias: true });
        document.body.appendChild(this.app.view as any);
        for (let i = 0; i < 80; i++) this.addNode();
        this.app.ticker.add(() => this.tick());
        (window as any).inspect = (id: string) => {
            this.selectedId = id;
            document.getElementById('inspector')!.style.display = 'block';
        };
    }

    addNode() {
        const id = `node_${this.nodes.size}`;
        const node = new SimulatedNode(id, Math.random() * window.innerWidth, Math.random() * window.innerHeight);
        this.nodes.set(id, node);
        this.app.stage.addChild(node.rangeGraphic);
        this.app.stage.addChild(node.graphic);
    }

    async injectMessage() {
        const msg: Message = { id: uuidv4(), channelId: 'global', senderId: 'GOD', timestamp: Date.now(), expiry: 0, priority: 1, payload: new TextEncoder().encode("GLOBAL ALERT") };
        this.seedMsgId = msg.id;
        const first = Array.from(this.nodes.values())[0];
        await first.engine.onMessagesReceived([msg]);
    }

    tick() {
        const nodesArr = Array.from(this.nodes.values());
        const now = Date.now();
        let reached = 0;

        for (let i = 0; i < nodesArr.length; i++) {
            const a = nodesArr[i];
            a.update(window.innerWidth, window.innerHeight);
            const hasMsg = a.driver.messages.some(m => m.id === this.seedMsgId);
            if (hasMsg) reached++;

            const color = hasMsg ? 0x007bff : (a.isSyncing ? 0xffcc00 : 0x666666);
            a.draw(color, a.id === this.selectedId);

            if (a.id === this.selectedId) {
                document.getElementById('inspectId')!.innerText = `ID: ${a.id}`;
                document.getElementById('inspectStorage')!.innerText = `Msgs: ${a.driver.messages.length}`;
            }

            for (let j = i + 1; j < nodesArr.length; j++) {
                const b = nodesArr[j];
                const dist = Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2);
                if (dist < 70) {
                    if (now - (a.lastSyncs.get(b.id) || 0) > 3000) {
                        a.lastSyncs.set(b.id, now); b.lastSyncs.set(a.id, now);
                        a.isSyncing = true; b.isSyncing = true;
                        // Bi-directional handshake trigger
                        a.engine.onPeerDiscovered(b.id, new SimTransport(this, a.id) as any);
                        b.engine.onPeerDiscovered(a.id, new SimTransport(this, b.id) as any);
                    }
                }
            }
        }
        document.getElementById('nodeCount')!.innerText = `Nodes: ${this.nodes.size}`;
        if (this.seedMsgId) document.getElementById('msgCount')!.innerText = `Saturation: ${Math.round((reached / this.nodes.size) * 100)}%`;
    }
}

const world = new World();
(window as any).injectMessage = () => world.injectMessage();
(window as any).addNodes = () => { for(let i=0; i<50; i++) world.addNode(); };
