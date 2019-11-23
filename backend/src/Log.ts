import {Config, ConfigKey} from "./Config";

enum LogLevel {
	TRACE,
	INFO,
	WARN,
	ERROR,
	NONE,
}

let LOG_LEVEL: LogLevel;

switch ((Config.getInstance().get(ConfigKey.logLevel) || "").toUpperCase()) {
	case "TRACE":
		LOG_LEVEL = LogLevel.TRACE;
		break;
	case "INFO":
		LOG_LEVEL = LogLevel.INFO;
		break;
	case "WARN":
		LOG_LEVEL = LogLevel.WARN;
		break;
	case "ERROR":
		LOG_LEVEL = LogLevel.ERROR;
		break;
	case "NONE":
	default:
		LOG_LEVEL = LogLevel.NONE;
}

export default class Log {
	// Based on
	// https://github.com/ubccpsc/classy/blob/master/packages/common/Log.ts
	public static trace(...msg: any[]) {
		if (LOG_LEVEL <= LogLevel.TRACE) {
			console.debug(`<T> ${new Date().toLocaleString()}:`, ...msg);
		}
	}
	public static info(...msg: any[]) {
		if (LOG_LEVEL <= LogLevel.INFO) {
			console.info(`<I> ${new Date().toLocaleString()}:`, ...msg);
		}
	}
	public static warn(...msg: any[]) {
		if (LOG_LEVEL <= LogLevel.WARN) {
			console.warn(`<W> ${new Date().toLocaleString()}:`, ...msg);
		}
	}
	public static error(...msg: any[]) {
		if (LOG_LEVEL <= LogLevel.ERROR) {
			console.error(`<E> ${new Date().toLocaleString()}:`, ...msg);
		}
	}
}

export function trace(target: Object, propertyName: string, propertyDescriptor: PropertyDescriptor): PropertyDescriptor {
	return apply(target, propertyName, propertyDescriptor, Log.trace);
}

export function info(target: Object, propertyName: string, propertyDescriptor: PropertyDescriptor): PropertyDescriptor {
	return apply(target, propertyName, propertyDescriptor, Log.info);
}

function apply(target: Object, propertyName: string, propertyDescriptor: PropertyDescriptor, log): PropertyDescriptor {
	const method = propertyDescriptor.value;
	propertyDescriptor.value = function (...args: any[]) {
		const name = `${target.constructor.name}::${method.name}(..)`;
		log(`${name} - Begin`);
		let result;
		try {
			result = method.apply(this, args);
		} catch (e) {
			Log.error(`${name} threw the error:`, e);
			throw e;
		}
		if (result instanceof Promise) {
			return result
				.then((v) => {log(`${name} - End`); return v})
				.catch((e) => {Log.error(`${name} threw the error:`, e); throw e; });
		} else {
			log(`${name} - End`);
			return result;
		}
	};
	return propertyDescriptor;
}