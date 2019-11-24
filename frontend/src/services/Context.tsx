import React, {useState, createContext, useRef} from "react";
import App from "../App";
import adapter from "../services/Adapter";

export interface IContext {
	token?: string,
	error?: string,
	operationsLoading: number,
	updateContext: (context: Partial<IContext>) => void
	startLoadingProcess: (context?: Partial<IContext>) => void
	endLoadingProcess: (context?: Partial<IContext>) => void
	scrollToBottom: () => void;
	authenticateAndLogout: () => void;
}

const Context = createContext<IContext>({
	operationsLoading: 0,
	updateContext: () => {},
	startLoadingProcess: () => {},
	endLoadingProcess: () => {},
	scrollToBottom: () => {},
	authenticateAndLogout: () => {},
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
		authenticateAndLogout: () => {},
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

	const authenticateAndLogout = () => {
		if (context.token) {
			adapter.checkToken(context.token)
				.then(({data, success}) => {
					if (!data) {
						newFunc( {
							error: "Your session has expired, please login in again.",
							token: undefined,
						})
					}
				});
		}
	};

	return (
		<ContextProvider value={{
			...context,
			updateContext: newFunc,
			startLoadingProcess,
			endLoadingProcess,
			scrollToBottom,
			authenticateAndLogout
		}}>
			<App/>
			<div ref={bottom} />
		</ContextProvider>
	)
};
