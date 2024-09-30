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

const createReplicache = (playerId: string) => {
	const replicache = new Replicache({
		name: playerId,
		// auth: `Bearer ${token}`,
		// licenseKey: "l24ea5a24b71247c1b2bb78fa2bca2336",
		licenseKey: import.meta.env.VITE_REPLICACHE_LICENSE_KEY,
		// pullURL:
		//   import.meta.env.VITE_API_URL +
		//   (dummy()
		//     ? `/replicache/dummy/pull?dummy=${dummy()}`
		//     : "/replicache/pull1"),
		// pushURL: import.meta.env.VITE_API_URL + "/replicache/push1",
		pullInterval: 60 * 1000,
		// mutators,
		// indexes: {
		//   id: {
		//     allowEmpty: true,
		//     jsonPointer: "/id",
		//   },
		// },
		pushURL: "/api/push",
		pullURL: "/api/pull",
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
}>;

export const ReplicacheProvider: Component<ReplicacheProviderProps> = (
	props,
) => {
	const rep = createMemo(() => {
		return createReplicache(props.playerId);
	});

	onCleanup(() => {
		rep().close();
	});

	createRealtimeSubscription(() => ({
		type: "message",
		callback() {
			console.log("PULL");
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
