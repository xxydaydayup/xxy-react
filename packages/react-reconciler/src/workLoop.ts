import { beginWork } from './beginWork';
import { commitMutationEffects } from './commitWork';
import { completeWork } from './completeWork';
import { createWorkInProgress, FiberNode, FiberRootNode } from './fiber';
import { MutationMask, NoFlags } from './fiberFlags';
import { HostRoot } from './workTags';

let workInProgress: FiberNode | null = null; //指向当前正在工作的FiberNode

function prepareFreshStack(root: FiberRootNode) {
	workInProgress = createWorkInProgress(root.current, {}); //初始化给WIP赋值，WIP由hostRootFiber（Root.current）得来
}

// 在Fiber中调度更新，之后会实现调度功能
export function scheduleUpdateOnFiber(fiber: FiberNode) {
	// TODO 调度功能
	// fiberRootNode,先要向上找到root，再进行render过程（目前还是render，还没有commit）
	const root = markUpdateFromFiberToRoot(fiber);
	renderRoot(root); //开始进入reconciler架构的render阶段workLoop
}

function markUpdateFromFiberToRoot(fiber: FiberNode) {
	//一般子Fiber通过return指向父Fiber直至hostRootFiber，hostRootFiber通过stateNode指向FiberRootNode(挂载根节点)
	let node = fiber;
	let parent = node.return;
	while (parent !== null) {
		node = parent;
		parent = node.return;
	}
	if (node.tag === HostRoot) {
		return node.stateNode;
	}
	return null;
}

function renderRoot(root: FiberRootNode) {
	// 初始化,给wip赋值为根节点，赋值完开始递归，workloop
	prepareFreshStack(root);
	do {
		try {
			workLoop();
			break;
		} catch (e) {
			if (__DEV__) {
				console.warn('workLoop发生错误', e);
			}
			workInProgress = null;
		}
	} while (true);

	// render阶段生成的 wip树 赋值给root.finishedWork
	const finishedWork = root.current.alternate;
	root.finishedWork = finishedWork;

	// render阶段（递+归）结束，生成了wip树,开始commit阶段
	// wip fiberNode树 树中的flags
	commitRoot(root);
}

// commit阶段要做的事：1.切换current树和wip树 2.执行placement对应的flag操作
function commitRoot(root: FiberRootNode) {
	const finishedWork = root.finishedWork; //commit阶段

	if (finishedWork === null) {
		return;
	}

	if (__DEV__) {
		console.log('commit阶段开始', finishedWork);
	}

	// 重置
	root.finishedWork = null;

	// 判断是否存在3个子阶段需要执行的操作
	// 根节点或者其子节点是否有更新flag，有flag
	const subtreeHasEffect =
		(finishedWork.subtreeFlags & MutationMask) !== NoFlags;
	const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;

	if (subtreeHasEffect || rootHasEffect) {
		// 阶段 1.beforeMutation

		// 阶段2.mutation Placement
		commitMutationEffects(finishedWork);

		root.current = finishedWork; //切换current树和wip树，发生在mutation和layout之间

		// 阶段3.layout
	} else {
		root.current = finishedWork; //切换current树和wip树，发生在mutation和layout之间
	}
}

function workLoop() {
	while (workInProgress !== null) {
		// 只要wip不为null，就执行工作单元
		performUnitOfWork(workInProgress); //wip还有，执行计算Fiber
	}
}

function performUnitOfWork(fiber: FiberNode) {
	const next = beginWork(fiber);
	fiber.memoizedProps = fiber.pendingProps; //memoizedProps保存执行结束后fiber的props
	if (next === null) {
		completeUnitOfWork(fiber); //没有next子节点了，递到了最下面，开始归,将wip指向兄弟节点
	} else {
		workInProgress = next; //还存在子节点，则将wip指向下一个FiberNode
	}
}

function completeUnitOfWork(fiber: FiberNode) {
	let node: FiberNode | null = fiber;
	do {
		completeWork(node);
		const sibling = node.sibling;
		if (sibling !== null) {
			workInProgress = sibling; //开始归,将wip指向兄弟节点
			return;
		}
		node = node.return; //没有兄弟节点，则把node赋值其return的父级节点
		workInProgress = node;
	} while (node !== null);
}
