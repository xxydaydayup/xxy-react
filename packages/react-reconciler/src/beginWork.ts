import { ReactElementType } from 'shared/ReactTypes';
import { mountChildFibers, reconcileChildFibers } from './childFibers';
import { FiberNode } from './fiber';
import { renderWithHooks } from './fiberHooks';
import { processUpdateQueue, UpdateQueue } from './updateQueue';
import {
	FunctionComponent,
	HostRoot,
	HostComponent,
	HostText
} from './workTags';

// 递归中的递阶段
// 作用：根据Fiber节点类型进入不同的逻辑
export const beginWork = (wip: FiberNode) => {
	// 比较，返回子fiberNode,三种情况HostRoot(根节点的Fiber类型)、HostComponent(普通DOM或自定义组件的Fiber类型)、HostText(文本节点的Fiber类型)

	switch (wip.tag) {
		case HostRoot:
			// 1.计算状态的最新值
			// 2.创造子fiberNode
			return updateHostRoot(wip);
		case HostComponent:
			// 1.创造子fiberNode
			return updateHostComponent(wip);
		case HostText:
			// 1.HostText类型的Fiber没有子节点，所以就没有beginWork阶段
			return null;
		case FunctionComponent:
			return updateFunctionComponent(wip);
		default:
			if (__DEV__) {
				console.warn('beginWork未实现的类型');
			}
			break;
	}
	return null;
};

function updateFunctionComponent(wip: FiberNode) {
	const nextChildren = renderWithHooks(wip);
	reconcileChildren(wip, nextChildren);
	return wip.child; //都会返回一个wip Fiber树
}

function updateHostRoot(wip: FiberNode) {
	const baseState = wip.memoizedState;
	const updateQueue = wip.updateQueue as UpdateQueue<Element>;
	const pending = updateQueue.shared.pending;
	updateQueue.shared.pending = null;
	const { memoizedState } = processUpdateQueue(baseState, pending);
	wip.memoizedState = memoizedState;

	const nextChildren = wip.memoizedState;
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

function updateHostComponent(wip: FiberNode) {
	const nextProps = wip.pendingProps;
	const nextChildren = nextProps.children;
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

function reconcileChildren(wip: FiberNode, children?: ReactElementType) {
	// current为父节点的 current FiberNode,从而找到子current FiberNode,然后和子reactElement比较，最终生成子wip
	const current = wip.alternate;

	if (current !== null) {
		// update
		wip.child = reconcileChildFibers(wip, current?.child, children);
	} else {
		// mount
		wip.child = mountChildFibers(wip, null, children);
	}
}
