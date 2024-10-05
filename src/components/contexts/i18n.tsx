import { flatten, resolveTemplate, translator } from "@solid-primitives/i18n";
import {
	type Accessor,
	type Component,
	type ParentProps,
	createContext,
	createMemo,
	createSignal,
	useContext,
} from "solid-js";

const enDict = {
	createBoard: {
		button: "Submit",
		columns: {
			label: "Columns",
			placeholder: "Enter number of columns",
		},
		name: {
			label: "Name",
			placeholder: "Enter board name",
		},
		rows: {
			label: "Rows",
			placeholder: "Enter number of rows",
		},
		mines: {
			label: "Mines(%)",
			placeholder: "Enter mines %",
		},
		title: "Create board",
	},
	error: {
		description: "Something went wrong: {{message}}",
		home: "Home",
		reload: "Reload",
		title: "Puzzle error",
	},
	info: {
		madeBy: "Made by wmalarski",
		title: "Solid Puzzle",
	},
	notFound: {
		title: "Not Found",
	},
	seo: {
		description:
			"Solid Minesweeper app is a non-trivial local first demo application built using Solid Start.",
		title: "Solid Minesweeper",
	},
	dialog: {
		close: "Close dialog",
	},
};

export type Locale = "en";

const dictionaries = { en: enDict };

type Accessed<T> = T extends Accessor<infer A> ? A : never;

export const createI18nValue = () => {
	const [locale, setLocale] = createSignal<Locale>("en");

	const translate = createMemo(() => {
		const dict = flatten(dictionaries[locale()]);
		return translator(() => dict, resolveTemplate);
	});

	const t: Accessed<typeof translate> = (path, ...args) => {
		return translate()(path, ...args);
	};

	return { locale, setLocale, t };
};

type I18nContextValue = ReturnType<typeof createI18nValue>;

export const I18nContext = createContext<I18nContextValue>({
	locale: () => "en" as const,
	setLocale: () => void 0,
	t: () => {
		throw new Error("Not implemented");
	},
});

export const I18nContextProvider: Component<ParentProps> = (props) => {
	const value = createI18nValue();

	return (
		<I18nContext.Provider value={value}>{props.children}</I18nContext.Provider>
	);
};

export const useI18n = () => {
	return useContext(I18nContext);
};
