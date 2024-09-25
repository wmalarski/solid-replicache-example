import { Replicache, type WriteTransaction } from "replicache";
import {
	type Component,
	type ParentProps,
	createContext,
	createMemo,
	onCleanup,
	useContext,
} from "solid-js";

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
		// pullInterval: 60 * 1000,
		// mutators,
		// indexes: {
		//   id: {
		//     allowEmpty: true,
		//     jsonPointer: "/id",
		//   },
		// },
		mutators: {
			async increment(tx: WriteTransaction, delta: number) {
				// Despite 'await' this get almost always responds instantly.
				// Same with `put` below.
				const prev = Number((await tx.get("count")) ?? 0);
				const next = prev + delta;
				await tx.set("count", next);
				return next;
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

	return (
		<ReplicacheContext.Provider value={rep}>
			{props.children}
		</ReplicacheContext.Provider>
	);
};
