import React, { useState, createContext } from "react";
import App from "../App";
import {interfaces} from "adapter";

export interface IContext {
	token?: string,
	error?: string,
	operationsLoading: number,
	updateContext: (context: Partial<IContext>) => void
	startLoadingProcess: (context?: Partial<IContext>) => void
	endLoadingProcess: (context?: Partial<IContext>) => void
}

const Context = createContext<IContext>({
	operationsLoading: 0,
	updateContext: () => {},
	startLoadingProcess: () => {},
	endLoadingProcess: () => {},
});

export const ContextProvider = Context.Provider;
export const ContextConsumer = Context.Consumer;
export default Context;

export const Root: React.FC = () => {

	const [context, updateContext] = useState<IContext>({
		operationsLoading: 0,
		updateContext: () => {},
		startLoadingProcess: () => {},
		endLoadingProcess: () => {},
	});

	const newFunc = (c: Partial<IContext>): void => {
		updateContext({
			...context,
			...c
		})
	};

	const startLoadingProcess = (c: Partial<IContext> = {}) => {
		newFunc({
			...c,
			operationsLoading: context.operationsLoading + 1
		});
	};

	const endLoadingProcess = (c: Partial<IContext> = {}) => {
		newFunc({
			...c,
			operationsLoading: context.operationsLoading > 0 ? context.operationsLoading - 1 : 0
		});
	};

	return (
		<ContextProvider value={{
			...context,
			updateContext: newFunc,
			startLoadingProcess,
			endLoadingProcess
		}}>
			<App/>
		</ContextProvider>
	)
};
