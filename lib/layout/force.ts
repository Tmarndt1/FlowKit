import { LayoutEdge, LayoutNode, LayoutResult } from "./types";

export interface ForceOptions {
    /** Number of simulation iterations. Default 300. */
    iterations?: number;
    /** Ideal spring length between connected nodes. Default 150. */
    springLength?: number;
    /** Initial temperature (max displacement). Default 100. */
    temperature?: number;
}

interface Vec2 { x: number; y: number }

export function forceLayout(
    nodes: LayoutNode[],
    edges: LayoutEdge[],
    options: ForceOptions = {}
): LayoutResult[] {
    const iterations = options.iterations ?? 300;
    const k = options.springLength ?? 150;
    const k2 = k * k;

    const positions = new Map<string, Vec2>();

    // Seed positions — use existing if non-zero, otherwise scatter in a circle
    const allZero = nodes.every((n) => n.x === 0 && n.y === 0);
    const radius = k * Math.sqrt(nodes.length);

    nodes.forEach((node, i) => {
        if (allZero) {
            const angle = (2 * Math.PI * i) / nodes.length;
            positions.set(node.key, { x: radius * Math.cos(angle), y: radius * Math.sin(angle) });
        } else {
            positions.set(node.key, { x: node.x, y: node.y });
        }
    });

    let temp = options.temperature ?? Math.max(100, k * 0.5);
    const cooling = temp / (iterations + 1);

    const keys = nodes.map((n) => n.key);
    const validEdge = new Set(nodes.map((n) => n.key));

    for (let iter = 0; iter < iterations; iter++) {
        const disp = new Map<string, Vec2>(keys.map((k) => [k, { x: 0, y: 0 }]));

        // Repulsion between all pairs
        for (let i = 0; i < keys.length; i++) {
            for (let j = i + 1; j < keys.length; j++) {
                const a = positions.get(keys[i])!;
                const b = positions.get(keys[j])!;
                let dx = a.x - b.x;
                let dy = a.y - b.y;
                const dist2 = dx * dx + dy * dy || 0.01;
                const dist = Math.sqrt(dist2);
                const force = k2 / dist;
                dx = (dx / dist) * force;
                dy = (dy / dist) * force;
                disp.get(keys[i])!.x += dx;
                disp.get(keys[i])!.y += dy;
                disp.get(keys[j])!.x -= dx;
                disp.get(keys[j])!.y -= dy;
            }
        }

        // Attraction along edges
        for (const edge of edges) {
            if (!validEdge.has(edge.sourceId) || !validEdge.has(edge.targetId)) continue;
            const a = positions.get(edge.sourceId)!;
            const b = positions.get(edge.targetId)!;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
            const force = (dist * dist) / k;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            disp.get(edge.sourceId)!.x += fx;
            disp.get(edge.sourceId)!.y += fy;
            disp.get(edge.targetId)!.x -= fx;
            disp.get(edge.targetId)!.y -= fy;
        }

        // Apply displacement capped by temperature
        for (const key of keys) {
            const d = disp.get(key)!;
            const mag = Math.sqrt(d.x * d.x + d.y * d.y) || 1;
            const scale = Math.min(mag, temp) / mag;
            const pos = positions.get(key)!;
            pos.x += d.x * scale;
            pos.y += d.y * scale;
        }

        temp -= cooling;
    }

    return keys.map((key) => ({ key, ...positions.get(key)! }));
}
