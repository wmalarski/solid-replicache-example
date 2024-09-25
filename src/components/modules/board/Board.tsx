import { nanoid } from "nanoid";
import type { ReadTransaction } from "replicache";
import { type Component, type ComponentProps, For } from "solid-js";
import { Button } from "~/components/ui/button";
import { Field } from "~/components/ui/field";
import {
	ReplicacheProvider,
	createSubscription,
	useReplicacheContext,
} from "~/contexts/replicache";
import type { Message } from "~/server/messages/types";
import { Stack } from "~/styled-system/jsx";
import { flex } from "~/styled-system/patterns";

type BoardProps = {
	playerId: string;
};

export default function Board(props: BoardProps) {
	return (
		<ReplicacheProvider playerId={props.playerId}>
			<Actions />
			<Messages />
		</ReplicacheProvider>
	);
}

const Actions: Component = () => {
	const rep = useReplicacheContext();

	const onClick = () => {
		rep().mutate.increment(1);
	};

	const counter = createSubscription((tx) => tx.get("count") ?? 0);

	return (
		<Button onClick={onClick} type="button">
			Click {JSON.stringify(counter.value)}
		</Button>
	);
};

const messagesSelector = async (tx: ReadTransaction) => {
	const list = await tx
		.scan<Message>({ prefix: "message/" })
		.entries()
		.toArray();
	list.sort(([, { order: a }], [, { order: b }]) => a - b);
	return list;
};

const Messages: Component = () => {
	const messages = createSubscription(messagesSelector, []);

	return (
		<Stack gap="4">
			<CreateMessageForm messages={messages.value} />
			<For each={messages.value}>
				{(value) => <pre>{JSON.stringify(value, null, 2)}</pre>}
			</For>
		</Stack>
	);
};

type CreateMessageFormProps = {
	messages: Awaited<ReturnType<typeof messagesSelector>>;
};

const CreateMessageForm: Component<CreateMessageFormProps> = (props) => {
	const rep = useReplicacheContext();

	let contentRef: HTMLInputElement | undefined;

	const onSubmit: ComponentProps<"form">["onSubmit"] = async (event) => {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);

		let last: Message | null = null;

		if (props.messages.length) {
			const lastMessageTuple = props.messages[props.messages.length - 1];
			last = lastMessageTuple[1];
		}

		const order = (last?.order ?? 0) + 1;
		const username = formData.get("username") as string;
		const content = formData.get("content") as string;

		await rep().mutate.createMessage({
			id: nanoid(),
			from: username,
			content,
			order,
		});

		if (contentRef) {
			contentRef.value = "";
		}
	};

	return (
		<form
			onSubmit={onSubmit}
			class={flex({ gap: "4", alignItems: "flex-end" })}
		>
			<Field.Root>
				<Field.Label>Username</Field.Label>
				<Field.Input name="username" />
			</Field.Root>
			<Field.Root>
				<Field.Label>Content</Field.Label>
				<Field.Input ref={contentRef} name="content" />
			</Field.Root>
			<Button>Submit</Button>
		</form>
	);
};
