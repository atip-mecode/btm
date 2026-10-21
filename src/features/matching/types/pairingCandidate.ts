export type Ready<Player> = { kind: "ready"; player: Player };
export type NotReady<Player> = { kind: "not_ready"; player: Player | null };
export type PairCandidate<Player> = readonly [Ready<Player> | NotReady<Player>, Ready<Player> | NotReady<Player>];
