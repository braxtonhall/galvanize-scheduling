import React, { useState, createContext } from "react";
import App from "../App";
import {interfaces} from "adapter";

export interface IContext {
	token?: string,
	error?: string,
	updateContext: (context: Partial<IContext>) => void
}

const Context = createContext<IContext>({
	updateContext: () => {},
});

export const ContextProvider = Context.Provider;
export const ContextConsumer = Context.Consumer;
export default Context

export const Root: React.FC = () => {

	const [context, updateContext] = useState<IContext>({
		updateContext: () => {},
	});

	const newFunc = (c: Partial<IContext>): void => {
		updateContext({
			...context,
			...c,
		})
	};

	return (
		<ContextProvider value={{
			...context,
			updateContext: newFunc,
		}}>
			<App/>
		</ContextProvider>
	)
};
