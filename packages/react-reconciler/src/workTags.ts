export type WorkTag =
	| typeof FunctionComponent
	| typeof HostRoot
	| typeof HostComponent
	| typeof HostText;

export const FunctionComponent = 0; //
export const HostRoot = 3; // 项目挂载的根节点对应的Fiber节点的类型
export const HostComponent = 5; // 下面div对应的类型就是HostComponent
//<div>123<div>

export const HostText = 6; // 上面div里面的文本123类型就是HostText
