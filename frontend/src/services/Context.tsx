import React, {useState, createContext, useEffect} from "react";
import App from "../App";
import adapter from "../services/Adapter";

export interface IContext {
	authenticated: boolean;
	error?: string,
	operationsLoading: number,
	updateContext: (context: Partial<IContext>) => void
	startLoadingProcess: (context?: Partial<IContext>) => void
	endLoadingProcess: (context?: Partial<IContext>) => void
}

const Context = createContext<IContext>({
	authenticated: false,
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
		authenticated: false,
		operationsLoading: 0,
		updateContext: () => {},
		startLoadingProcess: () => {},
		endLoadingProcess: () => {},
	});

	useEffect(() => {
		adapter.isAuthenticated()
			.then(({success, data}) => {
				updateContext({
					...context,
					authenticated: success ? data : false,
				})
			})
	}, []);

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
