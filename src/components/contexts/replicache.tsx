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
import type { InsertCellArgs, UpdateCellArgs } from "~/server/cells/db";
import type { GameCell } from "~/server/cells/types";
import { createRealtimeSubscription } from "./realtime";

export const getGameKey = (gameId: string) => {
	return `game/${gameId}/`;
};

type GetGameCellKeyArgs = {
	gameId: string;
	positionX: number;
	positionY: number;
};

export const getGameCellKey = ({
	gameId,
	positionX,
	positionY,
}: GetGameCellKeyArgs) => {
	return `${getGameKey(gameId)}${positionX}/${positionY}`;
};

const createReplicache = (playerId: string, gameId: string) => {
	const replicache = new Replicache({
		name: playerId,
		licenseKey: import.meta.env.VITE_REPLICACHE_LICENSE_KEY,
		pullInterval: 60 * 1000,
		pushURL: `/api/${gameId}/push`,
		pullURL: `/api/${gameId}/pull`,
		logLevel: "debug",
		mutators: {
			async insertCell(
				tx: WriteTransaction,
				{
					id,
					clicked,
					marked,
					positionX,
					positionY,
				}: Omit<InsertCellArgs, "gameId">,
			) {
				await tx.set(getGameCellKey({ gameId, positionX, positionY }), {
					id,
					gameId,
					clicked,
					marked,
					positionX,
					positionY,
				});
			},
			async updateCell(
				tx: WriteTransaction,
				{ positionX, positionY, clicked, marked }: UpdateCellArgs,
			) {
				const key = getGameCellKey({ gameId, positionX, positionY });
				const value = await tx.get(key);

				if (value) {
					await tx.set(key, { ...(value as GameCell), clicked, marked });
				}
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
