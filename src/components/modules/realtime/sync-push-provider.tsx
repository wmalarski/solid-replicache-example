import {
	type Component,
	type ParentProps,
	createContext,
	createMemo,
	createSignal,
	useContext,
} from "solid-js";
import { useReplicacheContext } from "~/components/contexts/replicache";

const createSyncPushState = () => {
	const rep = useReplicacheContext();

	const [sender, setSender] = createSignal<() => void>(() => void 0);

	const send = () => {
		sender()();
	};

	const setRemoteSender = (sender: () => void) => {
		setSender(() => sender);
	};

	const syncData = () => {
		rep().pull();
	};

	return { send, syncData, setRemoteSender };
};

type SyncPushContextState = ReturnType<typeof createSyncPushState>;

const SyncPushContext = createContext<() => SyncPushContextState>(() => {
	throw new Error("SyncPushContext not defined");
});

export const SyncPushProvider: Component<ParentProps> = (props) => {
	const value = createMemo(() => createSyncPushState());

	return (
		<SyncPushContext.Provider value={value}>
			{props.children}
		</SyncPushContext.Provider>
	);
};

export const useSyncPushContext = () => {
	return useContext(SyncPushContext);
};
