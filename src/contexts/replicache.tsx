import { Replicache } from "replicache";
import {
	type Component,
	type ParentProps,
	createContext,
	createMemo,
	onCleanup,
} from "solid-js";

const createReplicache = (userId: string) => {
	const replicache = new Replicache({
		name: userId,
		// auth: `Bearer ${token}`,
		// licenseKey: "l24ea5a24b71247c1b2bb78fa2bca2336",
		licenseKey: "",
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
	});

	return replicache;
};

const ReplicacheContext =
	createContext<() => ReturnType<typeof createReplicache>>();

type ReplicacheProviderProps = ParentProps<{
	userId: string;
}>;

export const ReplicacheProvider: Component<ReplicacheProviderProps> = (
	props,
) => {
	const rep = createMemo(() => {
		return createReplicache(props.userId);
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
