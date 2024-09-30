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
import type { MessageWithID } from "~/server/messages/types";
import { createRealtimeSubscription } from "./realtime";

const createReplicache = (playerId: string, serverId: string) => {
	const replicache = new Replicache({
		name: playerId,
		licenseKey: import.meta.env.VITE_REPLICACHE_LICENSE_KEY,
		pullInterval: 60 * 1000,
		pushURL: `/api/${serverId}/push`,
		pullURL: `/api/${serverId}/pull`,
		logLevel: "debug",
		mutators: {
			async createMessage(
				tx: WriteTransaction,
				{ id, from, content, order }: MessageWithID,
			) {
				await tx.set(`message/${id}`, {
					from,
					content,
					order,
				});
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
	serverId: string;
}>;

export const ReplicacheProvider: Component<ReplicacheProviderProps> = (
	props,
) => {
	const rep = createMemo(() => {
		return createReplicache(props.playerId, props.serverId);
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
