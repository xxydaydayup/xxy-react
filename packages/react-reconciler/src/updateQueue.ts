import { Dispatch } from 'react/src/currentDispatcher';
import { Action } from 'shared/ReactTypes';

export interface Update<State> {
	action: Action<State>; //代表更新的数据结构Update，目前Update接口只需要一个字段
}

export interface UpdateQueue<State> {
	shared: {
		pending: Update<State> | null; //UpdateQueue代表消费Update的数据结构
	};
	dispatch: Dispatch<State> | null;
}

export const createUpdate = <State>(action: Action<State>): Update<State> => {
	return {
		action
	};
};

export const createUpdateQueue = <Action>() => {
	return {
		shared: {
			pending: null
		},
		dispatch: null
	} as UpdateQueue<Action>;
};

//往update队列添加update的方法
export const enqueueUpdate = <Action>(
	updateQueue: UpdateQueue<Action> | any,
	update: Update<Action>
) => {
	updateQueue.shared.pending = update;
};

//消费update的方法，baseState是初始值，pendingUpdate是要消费的，memoizedState是返回的最新的
export const processUpdateQueue = <State>(
	baseState: State,
	pendingUpdate: Update<State> | null
): { memoizedState: State } => {
	const result: ReturnType<typeof processUpdateQueue<State>> = {
		memoizedState: baseState
	};

	//是否有需要消费的update，有就通过action的格式，分别消费，并赋值给memoizedState
	if (pendingUpdate !== null) {
		const action = pendingUpdate.action;
		if (action instanceof Function) {
			// baseState 1 update (x) => 4x -> memoizedState 4
			result.memoizedState = action(baseState);
		} else {
			// baseState 1 update 2 -> memoizedState 2
			result.memoizedState = action;
		}
	}

	return result;
};
