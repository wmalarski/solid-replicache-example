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
import type {} from "~/server/cells/db";
import type { GameCell } from "~/server/cells/types";
import { getGameCellKey, getGameKey } from "~/server/replicache/utils";
import { createRealtimeSubscription } from "./realtime";

const createReplicache = (playerId: string, gameId: string) => {
	const replicache = new Replicache({
		name: playerId,
		licenseKey: import.meta.env.VITE_REPLICACHE_LICENSE_KEY,
		pullInterval: 60 * 1000,
		pushURL: `/api/${gameId}/push`,
		pullURL: `/api/${gameId}/pull`,
		logLevel: "debug",
		mutators: {
			async insertCell(tx: WriteTransaction, args: GameCell) {
				await tx.set(getGameCellKey(args), args);
			},
			async updateCell(tx: WriteTransaction, args: GameCell) {
				await tx.set(getGameCellKey(args), args);
			},
			async deleteCells(tx: WriteTransaction) {
				const cells = await tx
					.scan<GameCell>({ prefix: getGameKey(gameId) })
					.entries()
					.toArray();

				await Promise.all(cells.map(([key]) => tx.del(key)));
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
	gameId: string;
}>;

export const ReplicacheProvider: Component<ReplicacheProviderProps> = (
	props,
) => {
	const rep = createMemo(() => {
		return createReplicache(props.playerId, props.gameId);
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
