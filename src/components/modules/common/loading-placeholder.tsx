import type { Component } from "solid-js";
import { Spinner } from "~/components/ui/spinner";
import { Stack } from "~/styled-system/jsx";

export const LoadingPlaceholder: Component = () => {
	return (
		<Stack alignItems="center" p={10} width="full">
			<Spinner size="lg" />
		</Stack>
	);
};
