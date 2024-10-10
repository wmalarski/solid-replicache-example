import {
	type ReadTransaction,
	Replicache,
	type WriteTransaction,
} from "replicache";
import {
	type Component,
	type ParentProps,
	createContext,
	createMemo,
	createResource,
	onCleanup,
	useContext,
} from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import type { GameCell } from "~/server/cells/types";
import type { SelectGameResult } from "~/server/games/db";
import type { ResetGameArgs } from "~/server/replicache/process-mutation";
import {
	getGameCellKey,
	getGameCellsPrefix,
	getGameKey,
	parseCellId,
} from "~/server/replicache/utils";
import { createRealtimeSubscription } from "./realtime";

const createReplicache = (playerId: string, spaceId: string) => {
	const replicache = new Replicache({
		name: playerId,
		licenseKey: import.meta.env.VITE_REPLICACHE_LICENSE_KEY,
		pullInterval: 60 * 1000,
		pushURL: `/api/${spaceId}/push`,
		pullURL: `/api/${spaceId}/pull`,
		logLevel: "debug",
		mutators: {
			async insertCell(tx: WriteTransaction, args: GameCell) {
				const { gameId, position } = parseCellId(args.id);
				await tx.set(getGameCellKey(spaceId, gameId, position), args);
			},
			async updateCell(tx: WriteTransaction, args: GameCell) {
				const { gameId, position } = parseCellId(args.id);
				await tx.set(getGameCellKey(spaceId, gameId, position), args);
			},
			async insertGame(tx: WriteTransaction, args: SelectGameResult) {
				await tx.set(getGameKey(spaceId, args.id), args);
			},
			async updateGame(tx: WriteTransaction, args: SelectGameResult) {
				await tx.set(getGameKey(spaceId, args.id), args);
			},
			async resetGame(
				tx: WriteTransaction,
				{ previousGameId, ...args }: ResetGameArgs,
			) {
				const cellsPrefix = getGameCellsPrefix(spaceId, previousGameId);
				const [cellsKeys] = await Promise.all([
					tx.scan({ prefix: cellsPrefix }).keys().toArray(),
					tx.del(getGameKey(spaceId, previousGameId)),
					tx.set(getGameKey(spaceId, args.id), args),
				]);
				await Promise.all(cellsKeys.map((cellKey) => tx.del(cellKey)));
			},
		},
	});

	return replicache;
};

const ReplicacheContext = createContext<
	() => ReturnType<typeof createReplicache>
>(() => {
	throw new Error("ReplicacheContext not defined");
});

export const useReplicacheContext = () => {
	return useContext(ReplicacheContext);
};

type ReplicacheProviderProps = ParentProps<{
	playerId: string;
	spaceId: string;
}>;

export const ReplicacheProvider: Component<ReplicacheProviderProps> = (
	props,
) => {
	const rep = createMemo(() => {
		return createReplicache(props.playerId, props.spaceId);
	});

	onCleanup(() => {
		rep().close();
	});

	createRealtimeSubscription(() => ({
		type: "message",
		callback() {
			rep().pull();
		},
	}));

	return (
		<ReplicacheContext.Provider value={rep}>
			{props.children}
		</ReplicacheContext.Provider>
	);
};

export function createSubscription<R>(
	cb: (tx: ReadTransaction) => Promise<R>,
): {
	value: R | undefined;
};
export function createSubscription<R>(
	cb: (tx: ReadTransaction) => Promise<R>,
	initial: R,
): {
	value: R;
};
export function createSubscription<R>(
	cb: (tx: ReadTransaction) => Promise<R>,
	initial?: R | undefined,
) {
	const [store, setStore] = createStore({
		value: initial,
	});

	const rep = useReplicacheContext();

	let subscription: () => void;

	const [r] = createResource(() => {
		if (subscription) {
			subscription();
		}
		subscription = rep().subscribe((tx) => cb(tx), {
			onData(result) {
				setStore(reconcile({ value: result }, { merge: true }));
			},
		});
	});

	return {
		get value() {
			r();
			return store.value;
		},
	};
}
