import { FormLayout, PageTitle } from "~/components/modules/common/layout";
import { CreateSpaceCard } from "~/components/modules/spaces/create-space-card";

export default function Home() {
	return (
		<FormLayout>
			<PageTitle />
			<CreateSpaceCard />
		</FormLayout>
	);
}
