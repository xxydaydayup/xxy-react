import { Props, Key, Ref, ReactElementType } from 'shared/ReactTypes';
import { FunctionComponent, HostComponent, WorkTag } from './workTags';
import { Flags, NoFlags } from './fiberFlags';
import { Container } from 'hostConfig'; // 因为在tsconfig.json中配置了paths，所以才能直接用hostConfig

export class FiberNode {
	type: any;
	tag: WorkTag;
	pendingProps: Props;
	key: Key;
	stateNode: any;
	ref: Ref;

	return: FiberNode | null;
	sibling: FiberNode | null;
	child: FiberNode | null;
	index: number;

	memoizedProps: Props | null;
	memoizedState: any; //对于FC的FiberNode，此属性指向当前FC的hooks链表
	alternate: FiberNode | null; //指向另一棵树，用于current树和WIP树切换，此FiberNode为current树，则此属性指向WIP树
	flags: Flags; // reactElement和FiberNode比较之后，生成子FiberNode的增删改操作标识
	subtreeFlags: Flags; // 子树中的flags,在completeWork阶段，将子树的flag冒泡上去，性能优化
	updateQueue: unknown;
	deletions: FiberNode[] | null;

	// tag: 标识FiberNode是什么类型的节点 ; pendingProps:接下来有哪些props需要改变；key:reactElement的key
	constructor(tag: WorkTag, pendingProps: Props, key: Key) {
		// 实例
		this.tag = tag;
		this.key = key;
		// HostComponent对应的DOM元素 <div> div DOM
		this.stateNode = null;
		// FunctionComponent () => {}
		this.type = null;

		// 构成树状结构
		this.return = null; // 指向父
		this.sibling = null;
		this.child = null;
		this.index = 0;

		this.ref = null;

		// 作为工作单元
		this.pendingProps = pendingProps; // 接下来有哪些props需要改变；
		this.memoizedProps = null; // 工作完后的props
		this.memoizedState = null; // 工作完后的state
		this.updateQueue = null; // 更新队列

		this.alternate = null;
		// 将flags叫做副作用 (就像useEffect的副作用类似概念，是RE和FiberNode比较之后而改变flags)
		this.flags = NoFlags;
		this.subtreeFlags = NoFlags;
		this.deletions = null;
	}
}

export class FiberRootNode {
	container: Container; //DOMElement 或者 其他环境的节点，这取决于宿主环境
	current: FiberNode;
	finishedWork: FiberNode | null;
	constructor(container: Container, hostRootFiber: FiberNode) {
		this.container = container;
		this.current = hostRootFiber;
		hostRootFiber.stateNode = this;
		this.finishedWork = null;
	}
}

export const createWorkInProgress = (
	current: FiberNode,
	pendingProps: Props
): FiberNode => {
	let wip = current.alternate;

	if (wip === null) {
		// mount  若无wip，即初始挂载阶段
		wip = new FiberNode(current.tag, pendingProps, current.key);
		wip.stateNode = current.stateNode;

		wip.alternate = current;
		current.alternate = wip;
	} else {
		// update 若有wip，即更新阶段
		wip.pendingProps = pendingProps;
		wip.flags = NoFlags;
		wip.subtreeFlags = NoFlags;
		wip.deletions = null;
	}
	wip.type = current.type;
	wip.updateQueue = current.updateQueue;
	wip.child = current.child;
	wip.memoizedProps = current.memoizedProps;
	wip.memoizedState = current.memoizedState;

	return wip;
};

export function createFiberFromElement(element: ReactElementType): FiberNode {
	const { type, key, props } = element;
	let fiberTag: WorkTag = FunctionComponent;

	if (typeof type === 'string') {
		// <div/> type: 'div'
		fiberTag = HostComponent;
	} else if (typeof type !== 'function' && __DEV__) {
		console.warn('为定义的type类型', element);
	}
	const fiber = new FiberNode(fiberTag, props, key);
	fiber.type = type;
	return fiber;
}
