import React, {useState, createContext, useRef} from "react";
import App from "../App";
import {interfaces} from "adapter";

export interface IContext {
	token?: string,
	error?: string,
	operationsLoading: number,
	updateContext: (context: Partial<IContext>) => void
	startLoadingProcess: (context?: Partial<IContext>) => void
	endLoadingProcess: (context?: Partial<IContext>) => void
	scrollToBottom: () => void;
}

const Context = createContext<IContext>({
	operationsLoading: 0,
	updateContext: () => {},
	startLoadingProcess: () => {},
	endLoadingProcess: () => {},
	scrollToBottom: () => {},
});

export const ContextProvider = Context.Provider;
export const ContextConsumer = Context.Consumer;
export default Context;

export const Root: React.FC = () => {

	const bottom = useRef(null);

	const [context, updateContext] = useState<IContext>({
		operationsLoading: 0,
		updateContext: () => {},
		startLoadingProcess: () => {},
		endLoadingProcess: () => {},
		scrollToBottom: () => {},
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

	const scrollToBottom = () => {
		bottom.current.scrollIntoView({behavior: "smooth"})
	};

	return (
		<ContextProvider value={{
			...context,
			updateContext: newFunc,
			startLoadingProcess,
			endLoadingProcess,
			scrollToBottom
		}}>
			<App/>
			<div ref={bottom} />
		</ContextProvider>
	)
};
