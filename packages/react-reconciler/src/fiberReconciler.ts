import { Container } from 'hostConfig';
import { ReactElementType } from 'shared/ReactTypes';
import { FiberNode, FiberRootNode } from './fiber';
import {
	createUpdate,
	createUpdateQueue,
	enqueueUpdate,
	UpdateQueue
} from './updateQueue';
import { scheduleUpdateOnFiber } from './workLoop';
import { HostRoot } from './workTags';

//ReactDOM.createRoot(rootElement).render(<App/>)中 createRoot方法调用时触发下面函数
export function createContainer(container: Container) {
	const hostRootFiber = new FiberNode(HostRoot, {}, null);
	const root = new FiberRootNode(container, hostRootFiber);
	hostRootFiber.updateQueue = createUpdateQueue();
	return root; //整个应用的根节点FiberRootNode
}

//ReactDOM.createRoot(rootElement).render(<App/>)中 render方法调用时触发下面函数
export function updateContainer(
	element: ReactElementType | null,
	root: FiberRootNode
) {
	const hostRootFiber = root.current; //将FiberRootNode与hostRootFiber连接起来
	const update = createUpdate<ReactElementType | null>(element); //这里创建update并将update放入update队列中，从而将首屏渲染和触发更新机制连接了起来
	enqueueUpdate(
		hostRootFiber.updateQueue as UpdateQueue<ReactElementType | null>,
		update
	);
	scheduleUpdateOnFiber(hostRootFiber); //在Fiber中调度，TODO
	return element;
}
